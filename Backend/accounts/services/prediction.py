from accounts.models import ProjectMetrics

# Préparer historique projet
def get_project_dataset(project):
    # Récupère métriques projet
    metrics = ProjectMetrics.objects.filter(project=project).order_by('date')

    data = []
     # Dernière progression
    last_progress = 0
    # Parcours métriques
    for m in metrics:
        # Calcul progression %
        progress = ((m.completed_tasks / m.total_tasks) * 100 if m.total_tasks > 0 else 0)
        # Nombre nouvelles tâches
        tasks_added = 0
        # Vérifie ancienne valeur
        if len(data) > 0:
            prev_tasks = data[-1]["total_tasks"]
            # Calcul tâches ajoutées
            if m.total_tasks > prev_tasks:
                tasks_added = m.total_tasks - prev_tasks
        # Ajoute données
        data.append({
            "date": m.date,
            "progress": progress,
            
            "total_cost": float(m.total_cost),
            "total_tasks": m.total_tasks,
            "completed_tasks": m.completed_tasks,
            "tasks_added": tasks_added
        })
        # Sauvegarde progression
        last_progress = progress

    return data

# Préparer données IA
def prepare_data_for_prediction(data):

    X = []
    y = []
    # Date début projet
    start_date = data[0]["date"]
    # Parcours données
    for d in data:
        #nombre jours passée
        days = (d["date"] - start_date).days
        X.append(days)
        # Progression projet
        y.append(d["progress"])

    return X, y
from prophet import Prophet
import pandas as pd

# Prédiction progression IA
def predict_progress_prophet(data, future_days):
    try:
        # Pas assez données
        if len(data) < 3:
            return data[-1]["progress"]
        # Conversion dataframe
        df = pd.DataFrame(data)
        # Supprime valeurs nulles
        df = df.dropna()
        # Trie par date
        df = df.sort_values("date")
        # Renomme colonnes Prophet
        df = df.rename(columns={
            "date": "ds",
            "progress": "y"  
        })
        # Création modèle IA
        model = Prophet()
        # Entraîne modèle
        model.fit(df)
        # Génère dates futures
        future = model.make_future_dataframe(periods=future_days)
        # Prédictions
        forecast = model.predict(future)
        # Dernière Prédictions
        result = forecast.tail(1)["yhat"].values[0]
        # Limite entre 0 et 100
        return min(max(result, 0), 100)

    except Exception as e:
         # Affiche erreur
        print(" Prophet error:", e)
        # Retour valeur actuelle
        return data[-1]["progress"]
# Prédiction simple intelligente
def predict_progress_smart(data, future_days):
    # Pas assez données
    if len(data) < 2:
        return data[-1]["progress"]
    # Progression actuelle
    current = data[-1]["progress"]
    # Ancienne progression
    prev = data[-2]["progress"]
    # Différence progression
    delta = current - prev
    # Si aucune évolution
    if delta == 0:
        return current

    # Petite progression
    if delta < 5:
        return min(current + 10, 100)

    # Progression normale
    return min(current + delta * future_days / 3, 100)


import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
# Prédiction coût projet
def predict_cost_prophet(data, future_days):

    import pandas as pd
    from prophet import Prophet
    # Conversion dataframe
    df = pd.DataFrame(data)
    df = df.dropna()
    df = df.sort_values("date")
    # Garde coûts positifs
    df = df[df["total_cost"] > 0]
    # Vérifie minimum données
    if len(df) < 2:
        return 0
    # Colonnes Prophet
    df = df.rename(columns={
        "date": "ds",
        "total_cost": "y"
    })
    # Croissance moyenne coût
    avg_growth = (df["y"].iloc[-1] - df["y"].iloc[0]) / len(df)
    # Limite maximale coût
    df["cap"] = df["y"].max() + avg_growth * future_days
    # Modèle Prophet
    model = Prophet(growth='logistic')
    # Entraîne modèle
    model.fit(df)
    # Génère futur
    future = model.make_future_dataframe(periods=future_days)
    future["cap"] = df["cap"].max()
    # Prédictions
    forecast = model.predict(future)
    # Dernier coût prévu
    result = forecast.tail(1)["yhat"].values[0]

    return float(result)
from accounts.models import ProjectAlert
# Créer alerte projet
def create_alert(project, alert_type, message):
    # Cherche ou crée alerte
    alert, created = ProjectAlert.objects.get_or_create(
        project=project,
        alert_type=alert_type,
        defaults={"message": message}
    )
    # Si existe déjà
    if not created:
        alert.message = message
        alert.is_active = True
        alert.save()
    
    # Mise à jour message
    if alert:
        alert.message = message
        alert.save()
    # Sinon création alerte
    else:
        ProjectAlert.objects.create(
            project=project,
            alert_type=alert_type,
            message=message
        )
# Désactiver alerte
def resolve_alert(project, alert_type):
    # Désactive alertes actives
    ProjectAlert.objects.filter(
        project=project,
        alert_type=alert_type,
        is_active=True
    ).update(is_active=False)


from datetime import date
from decimal import Decimal
# Mise à jour prédictions
def update_project_predictions(project):
    # Historique projet
    data = get_project_dataset(project)
    # Si pas données
    if not data:
        return
     # Dernière donnée
    current = data[-1]
    current_progress = current["progress"]

    from datetime import date
    # Calcul jours restants
    if project.end_date:
        remaining_days = (project.end_date - date.today()).days
    else:
        remaining_days = 7 
    # Minimum 1 jour
    if remaining_days <= 0:
        remaining_days = 1

    # Maximum 30 jours
    if remaining_days > 30:
        remaining_days = 30

    # Cas peu données
    if len(data) < 4:
        last = data[-1]
        progress = last["progress"]
        cost = last["total_cost"]
        # Estimation coût
        if progress > 0:
            predicted_cost = (cost / progress) * 100
        else:
            predicted_cost = cost

        predicted_progress = progress  
    # Prédiction coût IA    
    else:
        predicted_cost = predict_cost_prophet(data, remaining_days)
        # Vérifie données progression
        if len(data) < 3:
            predicted_progress = data[-1]["progress"]
        else:
            try:
                # Dataframe progression
                df = pd.DataFrame(data)
                df = df.rename(columns={"date": "ds", "progress": "y"})
                df = df.sort_values("ds")
                # Modèle Prophet
                model = Prophet()
                model.fit(df)
                # Futur progression
                future = model.make_future_dataframe(periods=remaining_days)
                forecast = model.predict(future)
                # Résultat progression
                predicted_progress = forecast.tail(1)["yhat"].values[0]
                # Limite 0-100
                predicted_progress = min(max(predicted_progress, 0), 100)

            except:
                predicted_progress = data[-1]["progress"] + 5
     # Sécurité progression
    if predicted_progress < current_progress:
        # Empêche baisse progression
        predicted_progress = current_progress
    # Si projet terminé
    if data[-1]["progress"] >= 100:
        predicted_progress = 100
    # Vérification finale
    if predicted_progress < data[-1]["progress"]:
        predicted_progress = data[-1]["progress"]
    # Sauvegarde prédictions
    # Sauvegarde coût prévu
    project.predicted_cost = round(predicted_cost, 2)
    # Sauvegarde progression prévue
    project.predicted_progress = round(predicted_progress, 1)
    # Vérifie si projet fini
    finished = predicted_progress >= 100
    # Limite max progression
    if predicted_progress > 100:
        predicted_progress = 100
    # Si projet terminé
    if finished:
        # Supprime alertes
        resolve_alert(project, "DELAY")
        resolve_alert(project, "EFFICIENCY")
        resolve_alert(project, "FUTURE_INEFFICIENCY")
        resolve_alert(project, "PROGRESS")
# Vérifie retard projet
    # Si projet pas fini
    # et progression faible
    if not finished and predicted_progress < 90:
        # Crée alerte retard
        create_alert(
            project,
            "DELAY",
            f" Le projet risque de ne pas être terminé à temps (seulement {round(predicted_progress,1)}% prévus)"
        )
    else:
        # Supprime alerte
        resolve_alert(project, "DELAY")
    # Vérifie dépassement budget
    # Si coût dépasse budget
    if project.budget and predicted_cost > project.budget:
        create_alert(
             # Crée alerte budget
            project,
            "BUDGET",
            f" Le coût prévisionnel ({round(predicted_cost)}) dépasse le budget ({project.budget})"
        )
    else:
        # Supprime alerte
        resolve_alert(project, "BUDGET")
    # Vérifie efficacité projet
    efficiency = 0
    # Si coût valide
    if predicted_cost > 0:
        # Calcul efficacité
        efficiency = predicted_progress / predicted_cost
         # Si progression faible et coût élevé
        if not finished and predicted_progress < 50 and predicted_cost > project.budget * Decimal("0.5"):
            # Crée alerte efficacité
            create_alert(project, "EFFICIENCY", " Faible efficacité : coût élevé par rapport à la progression")
        else:
            # Supprime alerte
            resolve_alert(project, "EFFICIENCY")
    # Analyse efficacité future
    # Différence progression
    delta_progress = predicted_progress - current["progress"]
    # Différence coût
    delta_cost = predicted_cost - current["total_cost"]
    # Si projet pas terminé
    if not finished:
        if delta_cost > 100:
            # Calcul efficacité future
            if delta_cost > 0:
                efficiency = delta_progress / delta_cost
            else:
                efficiency = 0
            # Si rendement faible
            if efficiency < 0.01:
                create_alert(
                     # Crée alerte
                    project,
                    "FUTURE_INEFFICIENCY",
                    f" Inefficacité future : +{round(delta_cost)} de coût pour seulement +{round(delta_progress,1)}% de progression"
                )
            else:
                # Supprime alerte
                resolve_alert(project, "FUTURE_INEFFICIENCY")
        else:
            resolve_alert(project, "FUTURE_INEFFICIENCY")
    else:
        resolve_alert(project, "FUTURE_INEFFICIENCY")
    project.save()
    

