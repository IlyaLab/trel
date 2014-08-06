
var base_query_url = '',
    gp_base_query_uri = '/google-dsapi-svc/addama/datasources/gp',
    cellname_uri = '/cell_info/query',
    geneids_uri = '/mv_gene_pmid/query',
    scores_uri = '/participation_scores/query',
    cell_scores_uri = '/mv_part_cells/query',
    genes_uri = '/participation_genes/query',
file_svc_uri = '/file-dsapi-svc/addama/datasources/gp';

var query_uri = '/query',
    annotations = {'cellname': null, 'gene_data' : null };

function loadGeneScores(entrez_id,success_callback,fail_callback) {
    var gene_scores = {data : null, reversal_labels: null};

    var timer =  new vq.utils.SyncDatasources(400,40,function() { parseGeneScoresMatrix(gene_scores, success_callback);},gene_scores,fail_callback);
    timer.start_poll();

    var query_str = 'select entrez_id, score_matrix ' +
            'where entrez_id = \'' + entrez_id + '\' limit 1';
    var scores_query = new google.visualization.Query(base_query_url + gp_base_query_uri + scores_uri);
    scores_query.setQuery(query_str);

    function scoresQueryHandle(response) {
          if (!response.isError()) {
              gene_scores['data'] = vq.utils.GoogleDSUtils.dataTableToArray(response.getDataTable());
          }  else {
              console.log('Participation Scores Request failed.');
          }
    }
    scores_query.send(scoresQueryHandle);
    var gene_query = 'select entrez_id, gene_matrix ' +
               'where entrez_id = \'' + entrez_id + '\' limit 1';
       var genes_query = new google.visualization.Query(base_query_url + gp_base_query_uri + genes_uri);
       genes_query.setQuery(gene_query);

       function genesQueryHandle(response) {
             if (!response.isError()) {
                 gene_scores['reversal_labels'] = vq.utils.GoogleDSUtils.dataTableToArray(response.getDataTable());
             }  else {
                 console.log('Participation Reversal Labels Request failed.');
             }
       }
       genes_query.send(genesQueryHandle);
}

function loadCellScores(cell_id,callback,fail_callback) {
    var cell_scores = {high_scores : null, low_scores : null};

    var timer =  new vq.utils.SyncDatasources(600,40,function() { parseCellScoresMatrix(cell_scores, callback);},cell_scores,fail_callback);
    timer.start_poll();

    var query_str = 'select cellname_id, entrez_id, gene_label, cell_matrix ' +
            'where cellname_id = \'' + cell_id + '\' order by sum_score DESC limit 100';
    var scores_query = new google.visualization.Query(base_query_url + gp_base_query_uri + cell_scores_uri);
    scores_query.setQuery(query_str);

    function scoresQueryHandle(response) {
          if (!response.isError()) {
              cell_scores['high_scores'] = vq.utils.GoogleDSUtils.dataTableToArray(response.getDataTable());
          }  else {
              console.log('Participation Scores Request failed.');
          }
    }
    scores_query.send(scoresQueryHandle);

    var low_str = 'select cellname_id, entrez_id, gene_label, cell_matrix ' +
            'where cellname_id = \'' + cell_id + '\' order by sum_score ASC limit 100';
    var low_scores_query = new google.visualization.Query(base_query_url + gp_base_query_uri + cell_scores_uri);
    low_scores_query.setQuery(low_str);

    function lowScoresQueryHandle(response) {
          if (!response.isError()) {
              cell_scores['low_scores'] = vq.utils.GoogleDSUtils.dataTableToArray(response.getDataTable());
          }  else {
              console.log('Participation Scores Request failed.');
          }
    }
    low_scores_query.send(lowScoresQueryHandle);

}

function parseCellScoresMatrix(cell_scores, callback) {
    var cell_data = {cells_matrix : null,entrez_id: null,gene_label : null};
    cell_data['data']=pv.blend([cell_scores['high_scores'],cell_scores['low_scores']])
     // var timer =  new vq.utils.SyncDatasources(400,40,function() { callback.apply(this,[cell_data]);},cell_data);
    // timer.start_poll();
    var rows = cell_data['data'].map(function(row) { return row.cell_matrix.split(',').map(function(value) { return parseFloat(value);});});
    cell_data['cells_matrix'] = rows;
    cell_data['entrez_id'] = cell_data['data'].map(function(row) { return row.entrez_id; });
    cell_data['gene_label'] = cell_data['data'].map(function(row) { return row.gene_label; });
    var name_map = {};
        annotations['cellname'].forEach(function(item) {
               	name_map[item.id+''] = item.label;});
    cell_data['columns'] = rows[0].map(function(value,index) { return name_map[index+1+'']; });
    callback.apply(this,[cell_data]);
}

function parseGeneScoresMatrix(gene_scores, callback) {
    var parsed_data = {scores_matrix : null,entrez_id: null};
     // var timer =  new vq.utils.SyncDatasources(400,40,function() { callback.apply(this,[parsed_data]);},parsed_data);
    // timer.start_poll();
    var rows = gene_scores['data'][0].score_matrix.split(';');
    parsed_data['scores_matrix'] = rows.map(function(row) { return row.split(',').map(function(str){return parseFloat(str);})});
    parsed_data['entrez_id'] = gene_scores['data'][0].entrez_id;

    callback.apply(this,[parsed_data]);
}

function loadAnnotations(callback) {

    annotations = {'cellname': null, 'gene_data' : null };

    var timer = new vq.utils.SyncDatasources(200,40,callback,annotations);
    timer.start_poll();
    var cellname_query = new google.visualization.Query(base_query_url + gp_base_query_uri + cellname_uri);
    cellname_query.setQuery('select `cell_id`, `label`,`desc`,`manuscript_id`, `obo_id`, `obo_def` order by `label` ASC label `cell_id` \'id\'');
    function handleCellnameQuery(response) {
        if (!response.isError()) {
            annotations['cellname'] = vq.utils.GoogleDSUtils.dataTableToArray(response.getDataTable());
        }
    }
    cellname_query.send(handleCellnameQuery);

    var geneid_query = new google.visualization.Query(base_query_url + gp_base_query_uri + geneids_uri);
    geneid_query.setQuery('select `entrez_id`, `gene_label`, `pmid_list` order by gene_label ASC label `entrez_id` \'id\', `gene_label` \'label\'');
    function handleGeneIdQuery(response) {
        if (!response.isError()) {
            annotations['gene_data'] = vq.utils.GoogleDSUtils.dataTableToArray(response.getDataTable());
        }
    }
    geneid_query.send(handleGeneIdQuery);

}

function requestGeneFile(entrez_id,label,type) {
    var location = file_svc_uri + gp_base_query_uri + scores_uri;
     var query_str = 'select entrez_id, score_matrix ' +
            'where entrez_id = \'' + entrez_id + '\' limit 1';
    var output_label = "gene_" + type;
    var output_filename =  label + "_scores_" +type;
 document.getElementById('dl_target').src = 'http://' + window.location.host + encodeURI(location +
                '?tq=' + query_str + '&tqx=out:' +output_label+';outFileName:'+output_filename);
}

function requestCellFile(cell_id,label,type) {
    var location = file_svc_uri + gp_base_query_uri + cell_scores_uri;
     var query_str =  'select cellname_id, entrez_id, gene_label, cell_matrix ' +
            'where cellname_id = \'' + cell_id + '\' order by sum_score DESC limit 100';
    var output_label = "cell_" + type;
    var output_filename = label + "_top100_scores_" + type;
 document.getElementById('dl_target').src = 'http://' + window.location.host + encodeURI(location +
                '?tq=' + query_str + '&tqx=out:' +output_label+';outFileName:'+output_filename);

   var low_str = 'select cellname_id, entrez_id, gene_label, cell_matrix ' +
            'where cellname_id = \'' + cell_id + '\' order by sum_score ASC limit 100';
    var output_filename_low = label + "_bottom100_scores_" + type;
 document.getElementById('dl_target2').src = 'http://' + window.location.host + encodeURI(location +
                '?tq=' + low_str + '&tqx=out:' +output_label+';outFileName:'+output_filename_low);
}

function requestFile (type,id,label,file_type) {
    switch(type) {
        case('gene'):
         requestGeneFile(id,label,file_type);
        break;
        case('cell'):
         requestCellFile(id,label,file_type);
        break;

    }
}

function downloadCellInfoFile(extension) {
    var output_label = extension;
    var location = base_query_url + gp_base_query_uri + cellname_uri;
    var query_string = 'select `cell_id`, `label`,`desc`,`manuscript_id`, `obo_id`, `obo_def` ' +
            'order by `cell_id` ASC label `cell_id` \'id\'';
    var output_filename = "celltype_info." + extension;
    if (extension =='tsv') {output_label='tsv-excel';}
 document.getElementById('dl_target').src  = 'http://' + window.location.host +
          encodeURI(location + '?tq=' + query_string + '&tqx=out:' +output_label+';outFileName:'+output_filename); ;
}