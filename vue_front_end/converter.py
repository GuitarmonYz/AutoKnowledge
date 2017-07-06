import json

id_list = set()
edge_list = set()
nodes = []
edges = []
with open('neo4j_data_example.json','r') as raw_data:
    json_data = json.load(raw_data)
    for raw_graph in json_data["results"][0]["data"]:
        for raw_node in raw_graph["graph"]["nodes"]:
            raw_node["id"] = int(raw_node["id"])

            if raw_node["id"] not in id_list:
                raw_node["properties"]["name"] = raw_node["properties"]["name"].encode('utf-8')
                id_list.add(raw_node["id"])
                nodes.append(raw_node)

        for raw_edge in raw_graph["graph"]["relationships"]:
            raw_edge["id"] = int(raw_edge["id"])
            if raw_edge["id"] not in edge_list:
                edge_list.add(raw_edge["id"])
                new_edge = {"value":raw_edge["type"],"source":raw_edge["startNode"],"target":raw_edge["endNode"]}
                edges.append(new_edge)

with open('result.json','w') as fp:
    json.dump({"nodes":nodes,"links":edges},fp)