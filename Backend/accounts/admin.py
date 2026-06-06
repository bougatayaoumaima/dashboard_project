from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Project, Task, CustomUser


class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = ("email", "username", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")

    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {"fields": ("role", "sub_role", "must_change_password")}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Custom Fields", {"fields": ("role", "sub_role", "must_change_password")}),
    )


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Project)
admin.site.register(Task)