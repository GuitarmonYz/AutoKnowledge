from rest_framework import serializers

class NodeSerializer(serializers.Serializer):
    """a serializer used to serialize neo4j-driver returned node objects
    """
    id = serializers.IntegerField()
    labels = serializers.ListField(child=serializers.CharField())
    properties = serializers.DictField()

class RelationshipSerializer(serializers.Serializer):
    """a serializer used to serialize neo4j-driver returned relationship objects
    """
    id = serializers.IntegerField()
    start = serializers.IntegerField()
    end = serializers.IntegerField()
    type = serializers.DictField()

class PathSerializer(serializers.Serializer):
    """a serializer used to serialize neo4j-driver returned path objects
    """
    start = serializers.IntegerField()
    end = serializers.IntegerField()
    size = serializers.IntegerField()
