from rest_framework import serializers

class NodeSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    labels = serializers.ListField(child=serializers.CharField())
    properties = serializers.DictField()

class RelationshipSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    start = serializers.IntegerField()
    end = serializers.IntegerField()
    type = serializers.DictField()

class PathSerializer(serializers.Serializer):
    start = serializers.IntegerField()
    end = serializers.IntegerField()
    size = serializers.IntegerField()
