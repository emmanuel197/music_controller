from django.urls import path
from .views import index

app_name = "frontend"
urlpatterns = [
    path('', index, name=""),
    path('create', index, name="create"),
    path('join', index, name="join"),
    path('room/<str:roomCode>', index, name="room")
]