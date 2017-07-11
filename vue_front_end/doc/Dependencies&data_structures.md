# Data structures

**从neo4j http接口获得的数据格式：**

```json
{
  "results":[
    {
      "columns":[
        <returned label>
      ],
       "data":[
         {
           "graph":{
             "nodes":[
               "id":<id>,
        		"labels": [
                  <labels>
        		],
      			"properties":{
                  <property-name>:<property-content>
      			}
             ]
           }
         },
    	{
          "data":[
            .......
          ]
    	}
       ]
    }
  ],
	"errors":[]
}
```

**vm： conditions, targets**

```json
{
  "type":<node type>,
  "content": <query content>
}
```

**Remove_conditions 中的回调参数：**

```
uncomment console.log(en) within remove_conditions
```

**resultVue： table_data**

```json
{
  "type":<node-type>,
  "properties":<a javascript object contains all properties>
}
```

**echarts 要求的节点和边数据格式**

```json
{
  "id":<id>
  "name":<name>,
  <other keys> 任意添加，不影响图的生成
}
{
  "source":<source-id>,
  "target":<target-id>,
  "value":<edge-name>
}
```

**预处理后的节点和边格式**

```json
{
  "nodes":[
    {
      <raw-node>:和neo4j返回的数据格式相同
    }
  ]，
  "edges":[
    {
      "source":<source-id>,
  	  "target":<target-id>,
      "value":<edge-name>
    }
  ]
}
```

**searchPath 返回值数据格式**

```javascript
[left_path_array,right_path_array]
lef_path_array/right_path_array = [<node_type>,<relation_name>,<direction_arrow>]
```

**adjtable 格式:**

*虽然知识图谱中的图是有向图，但是邻接表是按无向图处理的，因为这个邻接表的目的是帮助生成cypher语句时查找路径*

```javascript
{
 "<node-type>" => set("<node-type>/<relation-name>/<direction-arrow>", ..., ...),
 ...
}
```