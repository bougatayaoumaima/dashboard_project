from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Sum
from .models import Notification
from django.utils import timezone
from django.db import IntegrityError
from .models import ProjectAlert ,Role , Team ,SubTeam
from datetime import date
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
import math
User = get_user_model()


class LoginSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["role"] = user.role.name if user.role else None
        token["must_change_password"] = user.must_change_password
        token["id"] = user.id

        return token

    def validate(self, attrs):

        data = super().validate(attrs)

        data["username"] = self.user.username
        data["role"] = self.user.role.name if self.user.role else None
        
        data["id"] = self.user.id
        data["must_change_password"] = self.user.must_change_password

        return data        
        
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    profile_image = serializers.ImageField(use_url=True, required=False)
    role = serializers.SlugRelatedField(
    queryset=Role.objects.all(),
    slug_field="name",
    required=True
)

    team = serializers.PrimaryKeyRelatedField(
    queryset=Team.objects.all(),
    required=False,
    allow_null=True
)

    sub_team = serializers.PrimaryKeyRelatedField(
    queryset=SubTeam.objects.all(),
    required=False,
    allow_null=True
)
    
    role_name = serializers.CharField(
    source="role.name",
    read_only=True
)
    team_name = serializers.CharField(
    source="team.name",
    read_only=True
)

    sub_team_name = serializers.CharField(
    source="sub_team.name",
    read_only=True
)



    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "role",
            "role_name",
            "team",
            "sub_team",
            "team_name",
            "sub_team_name",
            "salary_per_hour",
            "monthly_salary",
            "profile_image",
            "is_active"         
            
]
        extra_kwargs = {
            "username": {"required": False},
            "monthly_salary": {"read_only": True}
        }

    def validate(self, attrs):
        if "email" in attrs:
            attrs["username"] = attrs["email"]

        role = attrs.get("role")
        team = attrs.get("team")
        sub_team = attrs.get("sub_team")

        if role and role.name == "MEMBRE":

            if not team:
                raise serializers.ValidationError({
                    "team": "L'équipe est obligatoire pour un membre"
            })

            if not sub_team:
                raise serializers.ValidationError({
                    "sub_team": "La sous-équipe est obligatoire pour un membre"
            })

        else:
            attrs["team"] = None
            attrs["sub_team"] = None

        return attrs
    def validate_email(self, value):
        user = self.instance   
        if User.objects.filter(email=value).exclude(id=user.id if user else None).exists():
            raise serializers.ValidationError("Cet email existe déjà")
        return value
    def create(self, validated_data):
        password = validated_data.pop("password",None)

        email = validated_data.get("email")

        validated_data["username"] = email

        user = User(**validated_data)

        user.set_password(password)

        user.save()

        email = EmailMessage(
            subject="Votre compte a été créé",

            body=f"""<h2>Bonjour {user.first_name}</h2>

<p>Votre compte a été créé avec succès.</p>

<p><b>Email :</b> {user.email}</p>
<p><b>Mot de passe :</b> {password}</p>

<a href="http://localhost:3000">
Changer le mot de passe
</a> """,

            from_email=settings.DEFAULT_FROM_EMAIL,

            to=[user.email],)

        email.content_subtype = "html"

        email.send()

        return user

        

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        instance.email = validated_data.get("email", instance.email)
        instance.username = instance.email
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)

        instance.role = validated_data.get("role", instance.role)
        instance.team = validated_data.get("team", instance.team)
        instance.sub_team = validated_data.get("sub_team", instance.sub_team)
        instance.salary_per_hour = validated_data.get("salary_per_hour",instance.salary_per_hour)
        if "profile_image" in validated_data:
            instance.profile_image = validated_data.get("profile_image")
            instance.username = instance.email

        if password:
            instance.set_password(password)

        instance.save()
        
        return instance

from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()


    chef_projet = serializers.PrimaryKeyRelatedField(
    queryset=User.objects.all()
)
    chef_projet_username = serializers.CharField(
        source="chef_projet.username",
        read_only=True
)
    

    members = UserSerializer(many=True, read_only=True)

    members_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        write_only=True,
        source="members",
        required=False
    )
    budget_used = serializers.SerializerMethodField()
    budget_remaining = serializers.SerializerMethodField()



    def get_progress(self, obj):
        tasks = obj.task_set.all()

        if not tasks.exists():
            return 0

        total = tasks.count()
        done = tasks.filter(status="terminee").count()


        return int((done / total) * 100)

    def get_budget_used(self, obj):
        return obj.task_set.aggregate(total=Sum("cost"))["total"] or 0

    def get_budget_remaining(self, obj):
        used = self.get_budget_used(obj)
        return obj.budget - used if obj.budget else 0

    class Meta:
        model = Project
        fields = '__all__'

    
    def update(self, instance, validated_data):
        members = validated_data.pop('members', None)

        instance = super().update(instance, validated_data)

        if members is not None:
            instance.members.set(members)

        return instance

    def validate(self, data):
        start = data.get("start_date", getattr(self.instance, "start_date", None))
        end = data.get("end_date", getattr(self.instance, "end_date", None))

        today = timezone.now().date()

        if not self.instance:
            if start and start < today:
                raise serializers.ValidationError("La date de début ne peut pas être dans le passé ")
        if start and end and end < start:
            raise serializers.ValidationError("La date de fin doit être après la date de début ")

        return data

from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    
    project_id = serializers.IntegerField(source="project.id", read_only=True)
    assigned_to_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True
    )

    project_name = serializers.CharField(source="project.name", read_only=True)

    chef_projet = serializers.CharField(
        source="project.chef_projet.username",
        read_only=True
    )


    

    def validate(self, data):

        title = data.get(
            "title",
            getattr(self.instance, "title", None)
        )

        hours = data.get(
            "hours",
            getattr(self.instance, "hours", None)
        )

        deadline = data.get(
            "deadline",
            getattr(self.instance, "deadline", None)
        )

        project = self.context.get("project") or getattr(
            self.instance,
            "project",
            None
        )
        if not title:
            raise serializers.ValidationError({
                "title": "Le titre est obligatoire"
            })

        existing_task = Task.objects.filter(
            project=project,
            title__iexact=title
        )

        if self.instance:
            existing_task = existing_task.exclude(id=self.instance.id)

        if existing_task.exists():
            raise serializers.ValidationError({"title": ["Une tâche avec ce titre existe déjà dans ce projet"]})

        if hours is None:
            raise serializers.ValidationError({
                "hours": ["Le nombre d'heures est obligatoire"]
            })

        if hours <= 0:
            raise serializers.ValidationError({
                "hours": ["Le nombre d'heures doit être supérieur à 0"]
            })

        if hours > 100:
            raise serializers.ValidationError({
                "hours": ["Le nombre d'heures ne peut pas dépasser 100"]
            })

        if not deadline:
            raise serializers.ValidationError({
                "deadline": ["La date limite est obligatoire"]
            })
        old_deadline=None

        if not self.instance:
            if deadline < date.today():
                raise serializers.ValidationError({"deadline": ["La date limite ne peut pas être dans le passé"] })

        else:
            old_deadline = self.instance.deadline

    # if utilisateur modifier le deadline et deadline inferieur a la date d'ajourd'hui elle fait un erreur
        if deadline != old_deadline and deadline < date.today():
            raise serializers.ValidationError({
                "deadline": ["La date limite ne peut pas être dans le passé"]})

    # if deadline superieur a la deadline de projet elle fait un erreur
        if project and project.end_date:

            if deadline > project.end_date:
                raise serializers.ValidationError({
                    "deadline": "La date limite de la tâche ne peut pas dépasser celle du projet"
                })

    # if nombre de jours li nestha9hom bsh toufa task superieur a les jours restants elle fait une erreur
        days_left = (deadline - date.today()).days + 1

        required_days = math.ceil(hours / 8)

        if required_days > days_left:
            raise serializers.ValidationError({
                "deadline": "Temps insuffisant pour réaliser cette tâche"
            })

        return data

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["cost", "project", "assigned_to", "created_by"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        


from rest_framework import serializers

class ProjectAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAlert
        fields = "__all__"

from .models import Role, Team, SubTeam


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"



class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = "__all__"



class SubTeamSerializer(serializers.ModelSerializer):

    team_name = serializers.CharField(
        source="team.name",
        read_only=True
    )

    class Meta:
        model = SubTeam
        fields = ["id", "name", "team", "team_name"]