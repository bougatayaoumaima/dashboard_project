from django.contrib.auth.models import AbstractUser
from django.db import models
from decimal import Decimal
from django.db.models import Sum
from django.conf import settings
from django.utils import timezone
from django.utils.timezone import now
class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class SubTeam(models.Model):
    name = models.CharField(max_length=100)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="sub_teams"
    )

    def __str__(self):
        return self.name

class CustomUser(AbstractUser):

    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )


    team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    sub_team = models.ForeignKey(
        SubTeam,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    
    salary_per_hour = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0)
    monthly_salary = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=0
)
    profile_image = models.ImageField(
        upload_to='profiles/',
        null=True,
        blank=True
    )
    must_change_password = models.BooleanField(default=True)
    from decimal import Decimal

    def save(self, *args, **kwargs):

        if self.salary_per_hour:
            self.monthly_salary = (
                Decimal(self.salary_per_hour) * Decimal(8) * Decimal(22)
            )

        super().save(*args, **kwargs)


class Project(models.Model):

    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours'),
        ('terminee', 'Terminée'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    budget_used = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='en_attente'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        related_name="created_projects"
    )

    chef_projet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="managed_projects"
    )

    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="team_projects",
        blank=True
    )

    predicted_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    predicted_progress = models.FloatField(default=0)
    initial_tasks = models.IntegerField(default=0)
    execution_prediction = models.FloatField(default=0)   
    scope_prediction = models.FloatField(default=0)       
    def __str__(self):
        return self.name


    def check_delay(self):
        
        today = timezone.now().date()

        if self.end_date and today > self.end_date and self.status != "terminee":
            pmo = self.created_by

            already_exists = Notification.objects.filter(
                project=self,
                type="delay"
            ).exists()

            if not already_exists:
                Notification.objects.create(
                   user=pmo,
                   project=self,
                   type="delay",
                   message=f"Le projet {self.name} est en retard"

                )


    def update_status(self):
        total_tasks = self.task_set.count()
        completed_tasks = self.task_set.filter(status="terminee").count()
        if total_tasks == 0:
            self.status = "en_attente"
        else:
            progress = (completed_tasks / total_tasks) * 100
            if progress == 100:
                self.status = "terminee"
            elif progress > 0:
                self.status = "en_cours"
            else:
                self.status = "en_attente"

        self.save()

from django.utils import timezone

class Task(models.Model):

    title = models.CharField(max_length=200)
    description = models.TextField()

    project = models.ForeignKey(Project,on_delete=models.CASCADE)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_tasks"
    )
    hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(
    max_length=20,
    choices=[
            ("en_attente", "En attente"),
            ("en_cours", "En cours"),
            ("terminee", "Terminée"),

    ],
    default="en_attente"
)
    created_at = models.DateTimeField(auto_now_add=True)

    deadline = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):

        old_status = None

        if self.pk:
            old_task = Task.objects.get(pk=self.pk)
            old_status = old_task.status

        if self.status == "terminee":
            if old_status != "terminee":
                if self.assigned_to and self.hours:
                    self.cost = (
                        Decimal(self.hours) *
                        self.assigned_to.salary_per_hour
                    )

        super().save(*args, **kwargs)

        total_tasks = Task.objects.filter(
            project=self.project
        ).count()

        if self.project.initial_tasks == 0 and total_tasks > 0:
            self.project.initial_tasks = total_tasks
            self.project.save(update_fields=["initial_tasks"])

        from accounts.services.prediction import update_project_predictions

        update_project_predictions(self.project)

        total = Task.objects.filter(
            project=self.project,
            status="terminee"
        ).aggregate(
            total_cost=Sum('cost')
        )['total_cost'] or 0

        old_budget_used = self.project.budget_used or 0

        self.project.budget_used = total
        self.project.save()
        self.project.update_status()

        pmo = self.project.created_by

        if (
            self.project.budget
            and old_budget_used <= self.project.budget
            and total > self.project.budget
        ):
            Notification.objects.create(
                user=pmo,
                project=self.project,
                type="danger",
                message=f"Le budget du projet {self.project.name} a été dépassé"
            )
        #calcul progress du projet
        completed_tasks = Task.objects.filter(
            project=self.project,
            status="terminee"
        ).count()

        progress = (
            completed_tasks / total_tasks * 100
        ) if total_tasks > 0 else 0

        today = now().date()

        metric, created = ProjectMetrics.objects.get_or_create(
            project=self.project,
            date=today,
            defaults={
                "total_cost": total,
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "progress": progress
            }
        )

        if not created:
            metric.total_cost = total
            metric.total_tasks = total_tasks
            metric.completed_tasks = completed_tasks
            metric.progress = progress
            metric.save()


    def is_late(self):
        if self.deadline and self.status != "terminee":
            return timezone.now().date() > self.deadline
        return False

        self.project.update_status()
          
class Notification(models.Model):

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=50, default="budget")
    project = models.ForeignKey("Project", on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.message


class ProjectMetrics(models.Model):

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    date = models.DateField()
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_tasks = models.IntegerField()
    completed_tasks = models.IntegerField()

    progress = models.FloatField()
    scope_change = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.project.name} - {self.date}"

    class Meta:
        unique_together = ('project', 'date')

class ProjectAlert(models.Model):

    ALERT_TYPES = (
        ('PROGRESS', 'Progression bloquée'),
        ('COST', 'Coût stagnant'),
        ('DELAY', 'Risque de retard'),
        ('BUDGET', 'Budget dépassé'),
        ('EFFICIENCY', 'Faible efficacité'),
        ('FUTURE_INEFFICIENCY', 'Inefficacité future'),

)

    project = models.ForeignKey('Project', on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.project} - {self.alert_type}"

        