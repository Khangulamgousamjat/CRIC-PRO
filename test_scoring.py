import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_full_scoring_flow():
    # 1. Setup Admin
    admin_data = {"username": "admin", "password": "password123"}
    requests.post(f"{BASE_URL}/auth/setup-admin", json=admin_data)

    # 2. Login
    login_data = {"username": "admin", "password": "password123"}
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Team
    team_response = requests.post(f"{BASE_URL}/teams/", json={"name": "Kolkata Knight Riders", "tournament_id": 1}, headers=headers)
    team_id = team_response.json()["id"]

    # 4. Create Players
    p1 = requests.post(f"{BASE_URL}/players/", json={"name": "S. Iyer", "role": "Batsman", "team_id": team_id}, headers=headers).json()["id"]
    p2 = requests.post(f"{BASE_URL}/players/", json={"name": "A. Russell", "role": "All-rounder", "team_id": team_id}, headers=headers).json()["id"]
    bowler = requests.post(f"{BASE_URL}/players/", json={"name": "M. Starc", "role": "Bowler", "team_id": team_id}, headers=headers).json()["id"]

    # 5. Create Match
    match_data = {
        "team1_id": team_id,
        "team2_id": team_id, # Simplified for test
        "venue": "Eden Gardens",
        "match_date": "2024-04-10T19:30:00"
    }
    match_response = requests.post(f"{BASE_URL}/matches/", json=match_data, headers=headers)
    match_id = match_response.json()["id"]

    # 6. Add Balls
    balls = [
        {"match_id": match_id, "over_no": 0, "ball_no": 1, "batsman_id": p1, "bowler_id": bowler, "non_striker_id": p2, "runs": 4, "extra_runs": 0},
        {"match_id": match_id, "over_no": 0, "ball_no": 2, "batsman_id": p1, "bowler_id": bowler, "non_striker_id": p2, "runs": 1, "extra_runs": 0},
        {"match_id": match_id, "over_no": 0, "ball_no": 3, "batsman_id": p2, "bowler_id": bowler, "non_striker_id": p1, "runs": 6, "extra_runs": 0},
        {"match_id": match_id, "over_no": 0, "ball_no": 4, "batsman_id": p2, "bowler_id": bowler, "non_striker_id": p1, "runs": 0, "extra_runs": 1, "extra_type": "wide"},
        {"match_id": match_id, "over_no": 0, "ball_no": 5, "batsman_id": p2, "bowler_id": bowler, "non_striker_id": p1, "runs": 0, "extra_runs": 0, "is_wicket": True, "wicket_type": "bowled"},
    ]
    
    for ball in balls:
        res = requests.post(f"{BASE_URL}/scoring/ball", json=ball, headers=headers)
        print(f"Added ball: {res.status_code}")

    # 7. Check Live Score
    live = requests.get(f"{BASE_URL}/scoring/live/{match_id}")
    print(f"Live Score: {live.json()}")

    # 8. Check Leaderboard
    leaderboard = requests.get(f"{BASE_URL}/stats/leaderboard")
    print(f"Leaderboard: {leaderboard.json()}")

if __name__ == "__main__":
    time.sleep(1) # Let server warm up
    test_full_scoring_flow()
