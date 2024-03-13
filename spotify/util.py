from django.utils import timezone
from .models import SpotifyToken
from datetime import timedelta
from requests import post, put, get
from .credentials import CLIENT_ID, CLIENT_SECRET

BASE_URL = "https://api.spotify.com/v1/me/"
def get_user_tokens(session_id):
    user_token = SpotifyToken.objects.filter(user=session_id)
    if user_token.exists():
        return user_token[0]
    else:
        return None
def update_or_create_user_tokens(session_id, access_token, token_type,  expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)
    print(tokens)
    if tokens:
        tokens.access_token = access_token
        tokens.token_type = token_type
        tokens.expires_in = expires_in
        tokens.refresh_token = refresh_token
        print(tokens.refresh_token)
        print(tokens.access_token)
        tokens.save(update_fields=["access_token", "refresh_token", "expires_in", "token_type"])
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token, token_type=token_type, expires_in=expires_in, refresh_token=refresh_token)
        tokens.save()

def is_spotify_authenticated(session_id):
    token = get_user_tokens(session_id)
    if token:
        expiry = token.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)
        return True
    
    return False
def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token
    response = post("https://accounts.spotify.com/api/token", data={
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token
    }).json()
    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")
    
    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)

def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    header = {"Content-Type": "application/json", "Authorization": "Bearer " + tokens.access_token}
    if post_:
        post(BASE_URL+endpoint, headers=header)
    if put_:
        put(BASE_URL+endpoint, headers=header)

    response = get(BASE_URL+endpoint, {}, headers=header)
    try:
        return response.json()
    except:
        return {'Error': 'Issue with request'}

def play_song(session_id):
    endpoint = "player/play"
    return execute_spotify_api_request(session_id, endpoint, put_=True)

def pause_song(session_id):
    endpoint = "player/pause"
    return execute_spotify_api_request(session_id, endpoint, put_=True)

def skip_song(session_id):
    endpoint = "player/next"    
    return execute_spotify_api_request(session_id, endpoint, post_=True)