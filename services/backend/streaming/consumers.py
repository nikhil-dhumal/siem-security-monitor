from channels.generic.websocket import AsyncWebsocketConsumer
import json

class LogConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("logs", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("logs", self.channel_name)

    async def receive(self, text_data):
        pass  # Handle incoming messages if needed

    async def send_log(self, event):
        await self.send(text_data=json.dumps(event["log"]))

class AlertConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("alerts", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("alerts", self.channel_name)

    async def receive(self, text_data):
        pass

    async def send_alert(self, event):
        await self.send(text_data=json.dumps(event["alert"]))