from django.shortcuts import render, redirect
from rest_framework.views import APIView
from requests import Request, post
from rest_framework.response import Response
from rest_framework import status
from .util import *
from api.models import Room
from .models import Vote
from dotenv import load_dotenv
import os


load_dotenv()
# Create your views here.   
class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing"
        url = Request("GET", "https://accounts.spotify.com/authorize", params={
            "client_id": os.environ.get("CLIENT_ID"),
            "response_type": "code",
            "redirect_uri": os.environ.get("REDIRECT_URI"),
            "scope": scopes
        }).prepare().url

        return Response({"url": url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    error = request.GET.get("error")
    code = request.GET.get("code")
    print(code)
    response = post("https://accounts.spotify.com/api/token", data={
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": os.environ.get("REDIRECT_URI"),
        "client_id": os.environ.get("CLIENT_ID"),
        "client_secret": os.environ.get("CLIENT_SECRET")
    }).json()
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)
    return redirect("frontend:")

class isAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)
    
class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "item" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        item = response.get("item")
        progress = response.get('progress_ms')
        duration = item.get('duration_ms')
        album_cover = item.get("album").get("images")[0].get("url")
        is_playing = response.get("is_playing")
        song_id = item.get("id")
        artist_string = ""

        for i, artist in enumerate(item.get("artists")):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name
        votes = len(Vote.objects.filter(room=room, song_id=room.current_song))
        song = {
            'title': item.get("name"),
            'artist': artist_string,
            'time': progress,
            'duration': duration,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'votes_required': room.votes_to_skip,
            'song_id': song_id
            }
        
        self.update_room_song(room, song_id)
        return Response(song, status=status.HTTP_200_OK)
    
    def update_room_song(self, room, song_id):
        if room.current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=["current_song"])
            votes = Vote.objects.filter(room=room).delete()

        
    

class PauseSong(APIView):
    
    def put(self, response, format=None):
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        if room.host == self.request.session.session_key or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)
    
class PlaySong(APIView):
    def put(self, response, format=None):
        
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        if room.host == self.request.session.session_key or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class SkipSong(APIView):
    def post(self, request, format=None):
        
        room_code = self.request.session.get("room_code")
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.votes_to_skip
        if room.host == self.request.session.session_key or len(votes) + 1 >= votes_needed:
            votes.delete()
            skip_song(room.host)
            
        else:
            vote = Vote(user=self.request.session.session_key, room=room, song_id=room.current_song)
            vote.save()

        return Response({}, status=status.HTTP_204_NO_CONTENT)