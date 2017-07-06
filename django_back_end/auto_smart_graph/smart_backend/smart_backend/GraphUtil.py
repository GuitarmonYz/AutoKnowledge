import requests

class GraphUtil(object):
    def __init__(self):
        self.adj_table_ = self._get_adjtable(self)
    @staticmethod
    def _get_adjtable(self):
        return generate_adjtable(knowledge_graph_processor(get_knowledge_graph()))
    def build_cypher(self, conditions, targets, enable_like, enable_graph):
        path = search_path([key['type'] for key in conditions], [key['type'] for key in targets], self.adj_table_)
        left_path_clause = str()
        right_path_clause = str()
        path_clause = str()
        where_tmp_clause = str()
        return_tmp_clause = str()
        return_graph_clause = str()
        for path_array in path[0]:
            if path_array[2] == '>':
                left_path_clause = '(' + path_array[0] + ':' + path_array[0] + ') <' + '- [' + path_array[1] +':' + path_array[1] + '] -' + left_path_clause
            else:
                left_path_clause = ' (' + path_array[0] + ':' + path_array[0] + ') ' + '- ['+ path_array[1] +':' + path_array[1] + '] ->' + left_path_clause
        if len(path) > 1:
            for path_array in path[1]:
                if path_array[2] == '>':
                    right_path_clause += ' - ['+path_array[1]+':' + path_array[1] + '] -' + path_array[2] + '('+path_array[0]+':'+path_array[0]+')'
                else:
                    right_path_clause += ' '+path_array[2] + '- ['+path_array[1]+':' + path_array[1] + '] - ' + '('+path_array[0]+':'+path_array[0]+')'
        path_clause = left_path_clause + '(' + conditions[0]['type'] + ':' + conditions[0]['type'] + ')' + right_path_clause
        for pair in conditions + targets:
            for key in pair['content']:
                where_tmp_clause += pair['type'] + '.' + key + ' = \"' + pair['content'][key] + '\" and '
        where_clause = ' where ' + where_tmp_clause[0: -4]
        for target in targets:
            return_tmp_clause += target['type'] + ', '
        if len(path) >1 :
            for path_array in path[0]+path[1]:
                return_graph_clause += path_array[1] + ', '
        else:
            for path_array in path[0]:
                return_graph_clause += path_array[1] + ','
        if enable_graph:
            return 'match ' + path_clause + where_clause + ' return ' + return_tmp_clause[0: -2] + return_graph_clause[0: -2], [key['type'] for key in targets]+[relationship[1] for relationship in path[0]+path[1]]
        else:
            return 'match ' + path_clause + where_clause + ' return ' + return_tmp_clause[0: -2], [key['type'] for key in targets]

def get_knowledge_graph():
    url = 'http://localhost:7474/db/data/transaction/commit'
    headers = {'Content-Type':'Application/json', 'Authorization':'Basic bmVvNGo6cm9vdA=='}
    data = {"statements" : \
    [{"statement" : "match (a)-[r]->(b) return distinct labels(a),labels(b), type(r)"}]}
    response = requests.post(url, json=data, headers=headers)
    # json_res = response.json()
    return response.json()

def knowledge_graph_processor(raw_json):
    edges = []
    nodes = []
    node_set = set()
    for relationship in raw_json['results'][0]['data']:
        new_edge = {
            "source": relationship['row'][0][0],
            "target": relationship['row'][1][0],
            "value": relationship['row'][2]
        }
        node_set.add(relationship['row'][0][0])
        node_set.add(relationship['row'][1][0])
        edges.append(new_edge)
    for node in node_set:
        nodes.append({'name':node})
    return {'nodes':nodes, 'links':edges}

def generate_adjtable(graph):
    adj_table = {}
    for link in graph['links']:
        if not adj_table.has_key(link['source']):
            source_tmp = set()
            source_tmp.add(link['target']+'/'+link['value']+'/>')
            adj_table[link['source']] = source_tmp
        else:
            adj_table[link['source']].add(link['target'] + '/' + link['value'] + '/>')
        if not adj_table.has_key(link['target']):
            target_tmp = set()
            target_tmp.add(link['source'] + '/' + link['value'] + '/<')
            adj_table[link['target']] = target_tmp
        else:
            adj_table[link['target']].add(link['source'] + '/' + link['value'] + '/<')
    return adj_table

def search_path(conditions, targets, adj_table):
    targets_set = set(conditions + targets)
    path = []
    all_path = []
    stack = []
    visited = set()
    pre_depth = 0
    find_depth = 0
    visited.add(conditions[0])
    targets_set.remove(conditions[0])
    for str_link in adj_table[conditions[0]]:
        stack.append([str_link, 1])
    while stack:
        if not targets_set:
            if path:
                all_path.append(path)
            return all_path
        pop_array = stack.pop()
        cur_depth = pop_array[1]
        pop_res = pop_array[0].split('/')
        vertex = pop_res[0]

        if cur_depth <= pre_depth:
            if cur_depth == 1:
                i = 0
                while i < (pre_depth - find_depth):
                    path.pop()
                    i += 1
                if path:
                    all_path.append(path)
                find_depth = 0
                path = []
            else:
                i = 0
                while i < (pre_depth - cur_depth + 1):
                    path.pop()
                    i += 1
        pre_depth = cur_depth
        if vertex not in visited:
            visited.add(vertex)
            path.append(pop_res)
            if vertex in targets_set:
                find_depth = pop_array[1]
                targets_set.remove(vertex)
            for str_link in adj_table[vertex]:
                if str_link.split('/')[0] not in visited:
                    stack.append([str_link, cur_depth+1])
