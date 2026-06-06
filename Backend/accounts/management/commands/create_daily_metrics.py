from django.core.management.base import BaseCommand
from accounts.models import Project, ProjectMetrics


class Command(BaseCommand):
    help = "Fix project metrics (progress + scope_change)"

    def handle(self, *args, **kwargs):

        projects = Project.objects.all()
        total_fixed = 0

        for project in projects:

            metrics = ProjectMetrics.objects.filter(project=project).order_by("date")

            if not metrics.exists():
                continue

            if project.initial_tasks == 0:
                first = metrics.first()
                if first:
                    project.initial_tasks = first.total_tasks
                    project.save()
                    self.stdout.write(self.style.WARNING(
                        f" Project {project.id}: initial_tasks set to {project.initial_tasks}"
                    ))

            initial = project.initial_tasks

            for m in metrics:
                if initial > 0:
                    m.progress = (m.completed_tasks / initial) * 100
                    m.scope_change = m.total_tasks - initial
                    m.save()
                    total_fixed += 1

        self.stdout.write(self.style.SUCCESS(
            f" Metrics fixed successfully ({total_fixed} records updated)"
        ))