from django.urls import path
from .views import UserListView
from .views import UserListCreateView, UserDetailView,users_membres,users_chef_projet,change_password,my_profile,ProjectListCreateView,TaskListCreateView,users_pmo,my_notifications,member_tasks
from . import views

urlpatterns = [
    path("users/", UserListCreateView.as_view()),
    path("users/<int:id>/", UserDetailView.as_view()),
    path("projects/", ProjectListCreateView.as_view()),
    path("tasks/", TaskListCreateView.as_view()),
    path("users-chef/", users_chef_projet),
    path("users-membres/", users_membres),
    path("my-tasks/", views.my_tasks),
    path("tasks/<int:pk>/status/", views.update_task_status),
    path('change-password/', change_password),
    path("profile/", my_profile),
    path("projects/add-members/", views.add_members_to_project),
    path("projects/<int:project_id>/team/", views.project_team_detail),
    path("tasks/<int:task_id>/status/", views.update_task_status),
    path("projects/<int:pk>/", views.project_detail),
    path("users-pmo/", views.users_pmo),
    path('notifications/', my_notifications),
    path("tasks/<int:pk>/", views.task_detail),
    path('member/<int:member_id>/tasks/<int:project_id>/', member_tasks),
    path("remove-member/", views.remove_member),
    path('project-metrics/<int:project_id>/', views.project_metrics),
    path('project-analytics/<int:project_id>/', views.project_analytics),
    path('alerts/<int:project_id>/', views.project_alerts),
    path('notifications/history/', views.notifications_history),
    path('notifications/unread-count/', views.unread_notifications_count),
    path('notifications/read/<int:pk>/', views.mark_notification_read),
    path('notifications/mark-all-read/', views.mark_all_read),
    path("project_stats/", views.project_stats),
    path('alerts_stats/', views.alerts_stats),
    path('my-projects-predictions/', views.my_projects_predictions),
    path('users-stats/', views.users_stats),
    path('projects_avg_stats/', views.projects_avg_stats),
    path('dashboard-project-stats/', views.dashboard_project_stats),
    path("dashboard/tasks-evolution/",views.tasks_evolution),
    path('projects/<int:project_id>/report/',views.download_project_report),

    path("roles/", views.RoleListCreateView.as_view()),
    path("roles/<int:pk>/", views.RoleDetailView.as_view()),


    path("teams/", views.TeamListCreateView.as_view()),
    path("teams/<int:pk>/", views.TeamDetailView.as_view()),

    path("subteams/", views.SubTeamListCreateView.as_view()),
    path("subteams/<int:pk>/", views.SubTeamDetailView.as_view()),
    path("users/<int:id>/activate/",views.activate_user),
    path("users/<int:user_id>/reset-password/",views.reset_user_password),

]  