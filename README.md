# AutoKnowledge
A bundle of front-end and back-end application for neo4j graph database developed during intership in [BitAuto](http://ir.bitauto.com/phoenix.zhtml?c=240892&p=irol-IRHome). It is developed to implement a knowledge graph for automotive industry and provide fundational service for deeper application development such as mechine learning application based on knowledge graph, big data graph querying system, etc.

Note that the automotive data is not provided in this project, due to copyright. And thanks to AutoSmart.inc (车慧) for providing the dataset. 

## Front-End

### Function introduction

The front end is developed using Vue.js as framework for data binding, business logic, Echarts.js for graph data visualization, and Element.js as UI components library.

The knowledge graph is presented as a graph with labeled nodes and relationships.

By double clicking on the nodes, you will activate target/condition choosing circle. After deciding query conditions and query targets,  you can set query contents in the conditions/targets input box. With the power of graph database Neo4j, the system can support query with multiple conditions and multiple relationships as target or conditions. 

The query result is a JSON object returned from Neo4j API, and then rendered in the form of graph, the number of returned results can be limited by setting params in source code, after node reducing, the ratio of in-out degree of each node remains the same. By clicking on the node, a detailed information table will be presented on the left panel.

![graph_query_demo](https://github.com/GuitarmonYz/AutoKnowledge/blob/master/graph_query_demo.gif?raw=true)

### Implementation 

Within the front-end source code, large amont of work is dedicated to graph searching algorithms, with DFS-like algorithms, the system is able to generate cypher sqls that require the path from query condition to target. Note that usually this part of function should be implemented in the back-end and front-end is only incharge of rendering data and UI logic, but due to time limit, this front-end implementation handled large amount of back-end jobs.

The reason to use Echarts.js instead of D3.js as visualization tool is to spread the popularity of Echarts.js, it is a canvas based rendering library and have better configuration syntex then D3.js. But D3.js is still more powerful(has more functionalities) than Echarts.js, for a more complex system, it should use D3.js as visualization engine.

The Vue.js makes it easy to deal with manipulating data in this data-rich application, vue-resource is used to get asyn data. VUEX, which is similar to REDUX in react.js, is not  used since the number of pages is small and doesn't need extra control on state switching.

## Back-End

### Funcational introduction

The back-end is developed using Django REST Framework. It connects with Neo4j using neo4j native python api, and provide query service with a post request that contains targets and conditions information.

![django_query_demo](https://github.com/GuitarmonYz/AutoKnowledge/blob/master/django_query_demo.gif?raw=true)

### Implementation

Like front-end, large of amont of effort is dedicated to graph search algorithms, if time is not a concern, a better solution would be using Neo4j embeded development approach which use Java to access all native Neo4j graph search APIs, it is more stable and more flexible for complex systems. 

## Database

### Function introduction

The database can be managed with a provided web-based UI, which supports the graph query, adding nodes and edges in the knowledge graph etc. It provides rest api for front-end and give access to back-end driver.

![database_demo](https://github.com/GuitarmonYz/AutoKnowledge/blob/master/database_demo.gif?raw=true)

### Implementation

To implement a knowledge graph, a graph database will be much better over databases like Mysql and MongoDb. In this application, we choose Neo4j as our graph database, which is one of the most popular graph database recently. It uses its own sql language called Cypher which is easy to learn and perfectly fits for graph querying. It also offer nice feature to import data from CSV files using cypher script. The import process may take about 30min according to device computation power.