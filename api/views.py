from django.shortcuts import render
from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
# Create your views here.

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = "code"
    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = self.serializer_class(room[0]).data
                data["is_host"] = request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({"Room Not Found": "Invalid Room Code"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({"BAD REQUEST": "No code was passed to url"}, status=status.HTTP_400_BAD_REQUEST)

class JoinRoomView(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        code = request.data.get('code')
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                self.request.session["room_code"] = room.code
                return Response({"message": "Joined Successfully!"}, status=status.HTTP_200_OK)
            return Response({"Bad request": "Invalid Room Code"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"Bad request": "Invalid post data, did not find code key"}, status=status.HTTP_400_BAD_REQUEST)
class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer
    
    def post(self, request, format=None): 
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=["guest_can_pause", "votes_to_skip"])
                self.request.session["room_code"] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                self.request.session["room_code"] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response({"Bad Request": "Invalid data..."}, status=status.HTTP_400_BAD_REQUEST)

class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {"room_code": self.request.session.get("room_code")}
        return JsonResponse(data, status=status.HTTP_200_OK)
    

class LeaveRoom(APIView):
    def post(self, request, format=None):
        if "room_code" in self.request.session:
            self.request.session.pop("room_code")
            host_id = self.request.session.session_key
            room_result = Room.objects.filter(host=host_id)
            if len(room_result) > 0:
                room = room_result[0]
                room.delete()
        return Response({"message": "Success"}, status=status.HTTP_200_OK)
    

class UpdateView(APIView):
    serializer_class = UpdateRoomSerializer
    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        print(serializer)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            code = serializer.data.get("code")
            
            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({"msg": "Room not found."}, status=status.HTTP_404_NOT_FOUND)
            user_id = self.request.session.session_key
            room = queryset[0]
            if user_id != room.host:
                return Response({"msg": "You are not the host of this room"}, status=status.HTTP_403_FORBIDDEN)
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=["guest_can_pause", "votes_to_skip"])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
        return Response({"BAD REQUEST": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST)

            
        