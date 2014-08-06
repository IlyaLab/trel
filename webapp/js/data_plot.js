
    var color = pv.Scale.quantitative(-20,-10,-.1,.1,10,20).range('#00f','#88f','#eee','#eee','#f88','#f00');

function legend_draw(div) {
    var width = 180;
    var vis= new pv.Panel()
            .top(10)
            .left(0)
            .height(70)
            .width(width)
            .strokeStyle(null)
            .canvas(div);
    var x_axis = pv.Scale.linear(-20,20).range(0,width-20);
    var legend = vis.add(pv.Panel)
            .left(10)
            .right(10)
            .strokeStyle('black')
            .lineWidth(1)
            .bottom(30);
    legend.add(pv.Image)
            .image(color.by(function(x,y){ return x_axis.invert(x);}));

    legend.add(pv.Rule)
            .data(x_axis.ticks())
            .left(x_axis)
            .strokeStyle('#000')
            .lineWidth(1)
            .anchor('bottom').add(pv.Label)
            .font('10px bold Courier, monospace')
            .text(x_axis.tickFormat);

    vis.anchor('bottom').add(pv.Label)
            .text('Participation Score');

    vis.render();
}

function geneheatmap_plot(parsed_data,div) {
    var width=850, height=900;
    var matrix = parsed_data['scores_matrix'];
    var name_map = {};
        annotations['cellname'].forEach(function(item) {
                name_map[item.id+''] = item.label;});
    var labels = pv.range(1,annotations['cellname'].length+1,1).map(function(id) { return name_map[id+''];});
    var row_click = function(row) { openCellsByLabel(row);};
    var data = {
        PLOT :  {
            width : width,
            height: height,
            vertical_padding : 50,
            horizontal_padding: 300,
            font :"sans",
            container : div
        },
        data_matrix : matrix,
        row_labels : labels,
        column_labels : labels,
        row_label_prefix : '',
        row_label_font : '13px bold Courier, monospace',
        item_row_padding : 1,
        item_column_padding : 2,
        fill_style : color,
        item_width : 5,
 	item_height : 4,
        select_notifier: row_click,
        row_click_notifier : row_click
    };

    var heatmap_vis = new vq.OmicsHeatmap();
    var dataObject ={DATATYPE : "vq.models.OmicsHeatmapData", CONTENTS : data};

    heatmap_vis.draw(dataObject);
    return heatmap_vis;
}

function cellheatmap_plot(cell_data,div) {
    var width=900, height=1050;
    var matrix = cell_data['cells_matrix'];
    var row_labels = cell_data['gene_label'];
    var column_labels = cell_data['columns'];
    var row_click = function(row) { openGenesByLabel(row);};
    var data = {
        PLOT :  {
            width : width,
            height: height,
            vertical_padding : 70,
            horizontal_padding: 100,
            font :"sans",
            container : div
        },
        data_matrix : matrix,
        row_labels : row_labels,
        column_labels : column_labels,
        row_label_prefix : '',
        row_label_font : '14px bold Courier, monospace',

        item_row_padding : 1,
        item_column_padding : 2,
        item_width : 5,
        item_height : 4,
        fill_style : color,
        select_notifier: row_click,
        row_click_notifier : row_click
    };

    var heatmap_vis = new vq.OmicsHeatmap();
    var dataObject ={DATATYPE : "vq.models.OmicsHeatmapData", CONTENTS : data};

    heatmap_vis.draw(dataObject);

    return heatmap_vis;
}

 function gene_thumbmap(parsed_data,div) {
    var width=166, height=166;
    var matrix = parsed_data['scores_matrix'];
//    var click_behavior = function() { openCellsByLabel(label);};
        var heatmap_vis = new pv.Panel()
                    .height(height)
                    .width(width)
                    .left(0)
                    .top(0)
                    .canvas(div);

          var image_panel = heatmap_vis.add(pv.Panel)
                    .add(pv.Image)
                    .image(color.by(function(x,y){
                           return matrix[y][x]}));
    heatmap_vis.render();
    return heatmap_vis;
}

function renderGeneHeatmap(data,div_id) {
    heatmap_obj = geneheatmap_plot(data,document.getElementById(div_id));
}

function renderCellHeatmap(data,div_id) {
    heatmap_obj = cellheatmap_plot(data,document.getElementById(div_id));
}

function inter_chrom_click(node) {
    initiateScatterplot(node);
}

function initiateScatterplot(link) {
    loadFeatureData(link,function() {renderScatterPlot(link);});
}

function scatterplot_draw(div) {

         if (patients['data'].length != 1) {return;}  //prevent null plot
        var data = patients['data'][0];
    var patient_labels = annotations['patients'];
    var f1 = data.f1id, f2 = data.f2id,
            f1values = data.f1values.split(':').map(function(val) {return parseFloat(val);}),
            f2values = data.f2values.split(':').map(function(val) {return parseFloat(val);}),
    f1label = data.f1alias, f2label = data.f2alias;
    var data_array = [];
    for (var i=0; i< f1values.length; i++) {
        var obj = {};
        obj[f1] = f1values[i], obj[f2]=f2values[i], obj['patient_id'] = patient_labels[i];
        data_array.push(obj);
    }

    var tooltip = {};
    tooltip[data.f1alias] = f1,tooltip[data.f2alias] = f2,tooltip['Sample'] = 'patient_id';

       var sp = new vq.ScatterPlot();

        var config ={DATATYPE : "vq.models.ScatterPlotData", CONTENTS : {
            PLOT : {container: div,
                width : 400,
                height: 300,
            vertical_padding : 40, horizontal_padding: 40, font :"14px sans"},
            data_array: data_array,
            xcolumnid: f1,
            ycolumnid: f2,
            valuecolumnid: 'patient_id',
            xcolumnlabel : f1label,
            ycolumnlabel : f2label,
            valuecolumnlabel : 'Sample Id',
            tooltip_items : tooltip
        }};
        sp.draw(config);

    return sp;
}
