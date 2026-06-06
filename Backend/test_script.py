from accounts.models import Project
from accounts.services.prediction import (
    get_project_dataset,
    update_project_predictions
)

from datetime import timedelta

# 🔥 بدّل id
project = Project.objects.get(id=61)

# 📊 dataset
data = get_project_dataset(project)

print("=== DATA ===")
for d in data:
    print(d)

# 🔮 predictions
update_project_predictions(project)

print("\n=== PREDICTION ===")
print("Progress:", project.predicted_progress)
print("Cost:", project.predicted_cost)


# 🚀 FUTURE TEST
def test_future(data, project):

    last = data[-1]

    total_tasks = last["total_tasks"]
    completed_tasks = last["completed_tasks"]

    remaining_tasks = total_tasks - completed_tasks
    remaining_days = 10

    prediction_progress = project.predicted_progress
    prediction_cost = project.predicted_cost

    future = []

    if remaining_tasks > 0:

        total_days = remaining_days
        days_to_finish = max(1, min(remaining_tasks, total_days))

        for i in range(1, total_days + 1):

            date_i = last["date"] + timedelta(days=i)

            if i <= days_to_finish:

                ratio = (i / days_to_finish) ** 1.3

                progress = last["progress"] + (
                    (prediction_progress - last["progress"]) * ratio
                )

                cost = last["total_cost"] + (
                    (prediction_cost - last["total_cost"]) * ratio
                )

            else:
                progress = prediction_progress
                cost = prediction_cost

            future.append({
                "date": date_i,
                "progress": round(min(progress, 100), 2),
                "cost": round(cost, 2)
            })

    return future


future = test_future(data, project)

print("\n=== FUTURE ===")
for f in future:
    print(f["date"], "→", f["progress"])