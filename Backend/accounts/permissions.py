from rest_framework.permissions import BasePermission

class IsSystemAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "SYSTEM_ADMIN"

class IsPMO(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "PMO"

class IsChefProjet(BasePermission):
    def has_permission(self, request, view):
        return request.user.role and request.user.role.name == "CHEF_PROJET"
