USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///brand.csv" AS row
CREATE (:Maker {maker_id: row.entityid, maker_name: row.name, kg_update_time: row.updatetime, kg_create_time: row.createtime, kg_is_enabled: row.isnabled, kg_is_removed: row.isremoved, kg_country_id: row.countryid, brand_id: row.masterbrandid, maker_othername: row.othername, maker_englishname: row.englishname, kg_telephone_number: row.phone, kg_website: row.website, make_introduction: row.introduction, kg_logo_url: row.logo, maker_spell: row.spell, maker_sale_status: row.salestatus});

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///masterbrand.csv" AS row
CREATE (:Brand {brand_id: row.entityid, brand_name: row.name, kg_updatetime: row.updatetime, kg_createtime: row.createtime, kg_is_enabled: row.isenabled, kg_is_removed: row.isremoved, brand_othername: row.othername, brand_englishname: row.englishname, kg_country_id: row.countryid, kg_logo_url: row.logourl, brand_spell: row.spell, kg_logo_story: row.logomeaning, brand_introduction: row.introduction});

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///manufacturer.csv" AS row
CREATE (:Manufacturer {manufacturer_id: row.entityid, manufacturer_name: row.name, kg_update_time: row.updatetime, kg_create_time: row.createtime, kg_is_enabled: row.isenabled, kg_is_removed: row.isremoved, manufacturer_shortname: row.shortname, manufacturer_othername: row.othername, manufacturer_englishname: row.englishname, kg_country_id: row.countryid, kg_telephone_number: row.phone, kg_website: row.website, manufacturer_introduction: row.introduction, kg_logo_url: row.logo, manufacturer_spell: row.spell});

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///model.csv" AS row
CREATE (:Model {model_id: row.entityid, model_name: row.name, kg_update_time: row.updatetime, kg_create_time: row.createtime, kg_is_enabled: row.isenabled, kg_is_removed: row.isremoved, maker_id: row.makeid, model_othername: row.othername, model_englishname: row.englishname, kg_website: row.website, kg_telephone_number: row.phone, model_introduction: row.introduction, model_level: row.modellevel, model_second_second: row.modellevelsecond, model_sale_status: row.salestatus, model_spell: row.spell, model_allspell: row.allspell, model_bodyform: row.modelbodyform, model_display: row.displayname, model_use: row._use, model_advantage: row.advantage, model_defect: row.defect, model_warranty: row.warranty, model_important_level: row.importantlevel, model_order_id: row.orderid});

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///style.csv" AS row
CREATE (:Style {style_id: row.entityid, style_name: row.name, kg_update_time: row.updatetime, kg_create_time: row.createtime, kg_is_enabled: row.isenabled, kg_is_removed: row.isremoved, model_id: row.modelid, year: row.year, style_body_type: row.stylebodytype, style_is_wagon: row.iswagon, style_msrp: row.nowmsrp, salestatus: row.salestatus, productionstatus: row.productionstatus, style_time_market: row.timetomarket, style_bodycolor: row.bodycolor, style_interior_color: row.neishicolor});

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///dealer.csv" AS row
CREATE (:Dealer {dealer_id: row.siteid, dealer_name: row.name, kg_website: row.url, kg_create_time: row.crawltime, brand_name: row.brand, brand_id: row.brandid, kg_telephone: row.telphone, kg_province: row.province, kg_city: row.city, kg_address: row.addr, site: row.site, dealer_price: row.price, dealer_news: row.news, dealer_introduction: row.introduction, dealer_hotlevel: row.hotlevel});

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///style.csv" AS row
MATCH (model:Model {model_id: row.modelid})
MATCH (style:Style {style_id: row.entityid})
MERGE (model)-[:_STYLE]->(style);

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///dealer.csv" AS row
MATCH (dealer:Dealer {dealer_id: row.siteid})
MATCH (brand:Brand {brand_id: row.brandid})
MERGE (brand)-[:SOLD_BY]->(dealer);

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///brand.csv" AS row
MATCH (brand:Brand {brand_id: row.masterbrand})
MATCH (maker:Maker {make_id: row.entityid})
MERGE (maker)-[:BELONG_TO]->(brand);

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///brand.csv" AS row
MATCH (manufacturer:Manufacturer {manufacturer_id: row.manufacturerid})
MATCH (maker:Maker {maker_id: row.entityid})
MERGE (maker)-[:MANUFACTED_BY]->(manufacturer);




