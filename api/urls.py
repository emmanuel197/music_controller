from django.urls import path
from .views import RoomView, CreateRoomView, GetRoom, JoinRoomView, UserInRoom, LeaveRoom, UpdateView
urlpatterns = [
    path('room', RoomView.as_view(), name="home"),
    path('create-room', CreateRoomView.as_view(), name="create"),
    path('get-room', GetRoom.as_view(), name="get-room"),
    path('join-room', JoinRoomView.as_view(), name='join-room'),
    path('user-in-room', UserInRoom.as_view(), name='user-in-room'),
    path('leave-room', LeaveRoom.as_view(), name='leave-room'),
    path('update-room', UpdateView.as_view(), name="update-room")
]
