if (trel === undefined) var trel = {};
 trel.load_mask = {};trel.details_window= {};trel.gene_heatmap_gallery= {};

 trel.helpWindowReference = null;

function export_svg() {
    var serializer = new XMLSerializer();
    var svg_tags;
    var panel_dom = Ext.getCmp('center-panel').layout.activeItem.id == 'pc-panel' ?  Ext.get('pc_draw').dom : Ext.get('circle-panel').dom;
    if (panel_dom.firstChild.id == ""){
        svg_tags =serializer.serializeToString(panel_dom.firstChild);
    }
    Ext.getCmp('export-textarea').setRawValue(svg_tags);
}

function setupNavTree() {
    var tree = Ext.getCmp('heatmap_nav').root;
    tree.appendChild(new Ext.tree.TreeNode({id:'gene',text:'Gene',leaf:false,iconCls:'gene',expanded:true, expandable:true}));
    tree.appendChild(new Ext.tree.TreeNode({id:'cell',text:'Cell',leaf:false,iconCls:'cell',expanded:true,expandable:true}));
}

function loadComboStores() {
    function handleAnnotations() {
        Ext.StoreMgr.get('gene_combo_store').loadData(annotations['gene_data']);
        Ext.getCmp('gene_combo').setValue(Ext.StoreMgr.get('gene_combo_store').getAt(0).json.id);
        Ext.StoreMgr.get('cell_combo_store').loadData(annotations['cellname']);
        Ext.getCmp('cell_combo').setValue(Ext.StoreMgr.get('cell_combo_store').getAt(0).json.id);
    }

    loadAnnotations(handleAnnotations);
}

function drawLegend(div_id) {
    legend_draw(document.getElementById(div_id));
}

function showCellInfo() {
    trel.cell_info_window.show();
}

function showDetailsWindow() {
    trel.details_window.show();
}

function showGeneGallery() {
    trel.gene_heatmap_gallery.show();
}

function renderGeneScores(tab_id,entrez_id) {
    var record = Ext.StoreMgr.get('gene_combo_store').getAt(Ext.StoreMgr.get('gene_combo_store').findExact('id',entrez_id));
    var label = record.get('label');

    function handleGeneScores(returned_data) {
        renderGeneHeatmap(returned_data,tab_id+'_draw');
        drawLegend(tab_id + '_legend');
        hideLoadMask();
        var thumb = document.getElementById(label+'_thumb_map')
        gene_thumbmap(returned_data, thumb);
        thumb.style.display="";
    }
    addHeatmapToGallery(label);
    loadGeneScores(entrez_id + '',handleGeneScores,function() { loadFailed(tab_id);});
}

function renderCellScores(tab_id,celltype) {
    function handleCellScores(returned_data) {
        renderCellHeatmap(returned_data,tab_id+'_draw');
        drawLegend(tab_id + '_legend');
        hideLoadMask();
    }
    loadCellScores(celltype + '',handleCellScores,function() { loadFailed(tab_id);});
}

function openTab(tab_id,title_label,data_id,renderFunction,activate) {
    var show_tab = (activate === undefined || activate);
    var type = tab_id.slice(0,4);
    if (Ext.getCmp(tab_id) === undefined) {
        var nav_panel = Ext.getCmp('heatmap_nav');
        var tree = nav_panel.root;
        tree.findChild('id',type).appendChild(new Ext.tree.AsyncTreeNode({id:tab_id,leaf:true,text:title_label,iconCls:type,expandable:false}));

        Ext.getCmp('center-panel').add(new Ext.Panel({
                id:tab_id,
                autoScroll : true,
                layout:'absolute',
                border : false,
                padding : 5,
                items:[{
                    xtype:'panel',
                    x:400,y:0,
                    id:tab_id + '_legend',
                    border: false
                },{
                    xtype:'panel',
                    x:0, y:0,
                    id:tab_id + '_draw',
                    border : false
                }],
                listeners:{
                    activate : function() {
                        if(Ext.getCmp(tab_id+'_draw') === undefined ||
                            Ext.getCmp(tab_id + '_draw').el.dom.firstChild.tagName != 'svg') {
                            showLoadMask('center-panel');
                            renderFunction(tab_id,data_id);}
                    }
                },
                tbar : {
                    cls:'x-panel-header',
                    height:25,
                    items:[
                        {xtype:'tbtext', text:title_label, style:{fontWeight:'bold',fontSize:'12px'}},
                        {xtype: 'tbspacer', width: 50},
                        {
                            text:'Export',
                            menu:[{
                                text:'CSV',
                                value:'csv',
                                iconCls:'download',
                                handler:function() {requestFile(type,data_id,title_label,'csv');}
                            },{
                                text:'TSV',value:'tsv',
                                iconCls:'download',
                                handler:function() {requestFile(type,data_id,title_label,'tsv');}
                            }]
                        }, {
                            //id:'detailsMenu',
                            text:'Details',
                            handler : function() {populateDetails(type,data_id);showDetailsWindow();}
                        },{
                            text:'Gallery',
                            handler : function() {showGeneGallery();}
                        }] }
            }
        ));
    }
    if (show_tab) {
        Ext.getCmp('center-panel').layout.setActiveItem(tab_id);
    }
}

String.prototype.trim = function() {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

function addHeatmapToGallery(label) {
    gallery_store.addSorted(new gallery_store.recordType({label:label}));
}

function removeHeatmapFromGallery(label) {
    gallery_store.remove(gallery_store.getAt(gallery_store.find('label',label)));
}


function populateDetails(data_type,data_id) {
    var record,label;
    var html_string = '';
    switch(data_type){
        case('gene'):
            record = Ext.StoreMgr.get('gene_combo_store').getById(data_id);
            label = record.get('label');
            var pmid = record.get('pmid_list');
            html_string += "<b>" + label + "</b>";
            html_string += " Entrez Id: " +data_id + " <br/><br/>";
            html_string += (pmid.length > 1 ? 'Pubmed articles: <ul>' + pmid.split(",").map(function(val){
                return '<li><a href="http://www.ncbi.nlm.nih.gov/pubmed/'+ val.trim()+'" target="_blank">PMID:'+ val.trim()+'</a>';
            }).join('')+'</ul><br/><br/>' : '');
            var gene_uri ='http://genome.ucsc.edu/cgi-bin/hgTracks?clade=mammal&org=Human&db=hg19&position=' + label;
            html_string += '<a href="'+gene_uri+'" target="_blank">UCSC Genome Browser</a><br/>';
            break;
        case('cell'):
            record = Ext.StoreMgr.get('cell_combo_store').getAt(Ext.StoreMgr.get('cell_combo_store').findExact('id',data_id));
            label = record.get('label');
            var desc = record.get('desc');
            var m_id = record.get('manuscript_id');
            var obo_id = record.get('obo_id');
            var obo_def = record.get('obo_def');
            html_string += "<b>" + label + "</b> <br/>";
            html_string +=  "<b>Cell Id:</b> " +data_id +"<br/>";
            html_string +=  "<b>OBO Definition:</b> " +obo_def +"<br/>";
            html_string += "<b>Manuscript ID:</b> " + m_id + "<br/>";
            html_string += "<b>OBO ID:</b> " + obo_id + "<br/>";
            html_string += desc ;
    }
    Ext.getCmp('info_panel').update(html_string);
}

function showLoadMask(cmp_id) {
    trel.load_mask = new Ext.LoadMask(cmp_id, {msg:"Loading Data..."});
    trel.load_mask.show();
}

function hideLoadMask() {
    trel.load_mask.hide();
}

function loadFailed(tab_id) {
    hideLoadMask();
    var data_type = tab_id.slice(0,4);
    Ext.getCmp('center-panel').remove(tab_id);
    var nav_panel = Ext.getCmp('heatmap_nav');
    var tree = nav_panel.root;
    tree.findChild('id',data_type).removeChild(tree.findChild('id',data_type).findChild('id',tab_id),true);
    if(data_type =='gene'){
        var data_id = tab_id.split('_')[2];
        var label = Ext.StoreMgr.get('gene_combo_store').getById(data_id).get('label');
        removeHeatmapFromGallery(label);
    }
    Ext.getCmp('center-panel').layout.setActiveItem(0);
    Ext.Msg.alert('Data Load Failed.','Please try to load the data again.');
}

function openGenesByLabel(gene_list) {
    function generateGeneTab(gene_label) {
        var entrez_id = parseInt(Ext.StoreMgr.get('gene_combo_store').getAt(Ext.StoreMgr.get('gene_combo_store').findExact('label',gene_label)).get('id'));
        var tab_id = 'gene_heatmap_' + entrez_id;
        openTab(tab_id,gene_label,entrez_id, renderGeneScores, activate);
    }
    var activate = typeof gene_list == 'string';
    if (activate) { generateGeneTab(gene_list); return; }
    gene_list.forEach(function(gene_label) {
        generateGeneTab(gene_label);
    });
}

function openCellsByLabel(cell_list) {
    function generateCellTab(cell_label) {
        var celltype = parseInt(Ext.StoreMgr.get('cell_combo_store').getAt(Ext.StoreMgr.get('cell_combo_store').findExact('label',cell_label)).get('id'));
        var tab_id = 'cell_heatmap_' + celltype;
        openTab(tab_id,cell_label,celltype, renderCellScores, activate);
    }
    var activate = typeof cell_list == 'string';
    if (activate) { generateCellTab(cell_list); return;}
    cell_list.forEach(function(cell_label){
        generateCellTab(cell_label);
    })
}

function openCellHeatmapTab() {
    var celltype = Ext.getCmp('cell_combo').getValue();
    var cell_label = Ext.StoreMgr.get('cell_combo_store').getById(celltype).get('label');
    var tab_id = 'cell_heatmap_' + celltype;
    openTab(tab_id,cell_label,celltype, renderCellScores);
}

function openGeneHeatmapTab() {
    var entrez_id = Ext.getCmp('gene_combo').getValue();
    var gene_label = Ext.StoreMgr.get('gene_combo_store').getById(entrez_id).get('label');
    var tab_id = 'gene_heatmap_' + entrez_id;
    openTab(tab_id,gene_label,entrez_id, renderGeneScores);
}

var gene_tpl = new Ext.XTemplate( '<tpl for=".">',
    '<div class="thumb-wrap" id="{label}_wrap">',
    '<div class="thumb" id ="{label}_thumb_map" title=""{label}">Loading...</div>',
    '<span class="x-editable">{label}</span></div>',
    '</tpl>',
    '<div class="x-clear"></div>'
);

var gallery_store = new Ext.data.JsonStore({
    autoLoad : false,
    fields : ['label'],
    idProperty:'label',
    sortInfo: {
        field:'label', direction:'ASC'
    },
    data:[],
    storeId:'gene_gallery_store'
});

Ext.onReady(function() {

    new Ext.Viewport({
        layout: {
            type: 'border',
            padding: 5
        },
        defaults: {
            split: true
        },
        items: [
            {
                region: 'north', id:'toolbar-region',
                collapsible: false,
                border : false,
                split: false,
                height: 27,
                layout : 'fit',
                tbar: [
                    { text:'Annotations',
                        menu:[{
                            text:'Cell Types',
                            value:'cell_types',
                            menu:[{
                                text:'Table',
                                iconCls:'table',
                                value:'cell_info_table',
                                handler:function() {showCellInfo();}
                            },{
                                text:'CSV',
                                iconCls:'download',
                                value:'cell_types_csv',
                                handler:function() {downloadCellInfoFile('csv');}
                            },
                                {
                                    text:'TSV',
                                    iconCls:'download',
                                    value:'cell_types_tsv',
                                    handler:function() {downloadCellInfoFile('tsv');}
                                }]
                        }]
                    },{
                        text:'Tools',
                        value:'tools_menu',
                        menu:[
                            {
                                text:'Topographic Landscape',
                                value:'topo_menu',
                                handler:function() {
                                   // {openBrowserTab(window.location.href + 'epiland/index.html')}
                                        trel.epiland_window.show();
                                }
                            },
                    {
                            text:'3D Landscape',
                            value:'3d_el_menu',
                            handler:function() {
                                {openBrowserTab(window.location.href + '3d/index.html')}
                            }
                        }]
                    },
                    {
                        text:'More Info',
                        menu:[{
                            text:'Published Paper',
                            value:'paper',
                            handler:function() {openBrowserTab('http://www.nature.com/nmeth/journal/v10/n6/full/nmeth.2445.html');}
                        },{
                            text:'OBO',value:'ontology',
                            menu:[{
                                text:'General',
                                value:'obo_general',
                                handler:function() {openBrowserTab('http://www.obofoundry.org');}
                            },
                                {
                                    text:'Cells',
                                    value:'obo_cells',
                                    handler:function() {openBrowserTab('http://www.obofoundry.org/cgi-bin/detail.cgi?id=cell');}
                                },
                                {
                                    text:'Uberon',
                                    value:'obo_uberon',
                                    handler:function() {openBrowserTab('http://www.obofoundry.org/cgi-bin/detail.cgi?id=uberon');}
                                }
                            ]
                        }]
                    }]
            },
            {region: 'west',
                id:'nav-region',
                collapsible: true,
                expanded: true,
                width: 220,
                layout: {
                    type: 'vbox',
                    defaultMargins:'5 5 0 5',
                    //padding: '5,5,5,5',
                    align: 'stretch'
                },
                defaults : {
                    padding : '0, 0, 5, 0'
                },
                items : [
                    {
                        xtype: 'form',  id:'lookup',
                        title : 'Lookup',
                        bodyStyle: 'padding:5px',
                        labelSeparator:':',
                        labelWidth : 1,
                        iconCls:'lookup',
                        tools: [{
                            id: 'help',
                            handler: function(event, toolEl, panel){
                                openHelpWindow('Export',celltypeLookupHelpString);
                            }}],
                        height : 90,
                        padding : '5',
                        items:[
                            {xtype:'compositefield',
                                items:[ {
                                    xtype:'button',
                                    text:'Cell',
                                    width: 30,
                                    listeners: {
                                        click : function() {
                                            openCellHeatmapTab();
                                        }
                                    }},
                                    {
                                        xtype:'combo',
                                        id:'cell_combo',
                                        mode:'local',
                                        allowBlank : true,
                                        store: new Ext.data.JsonStore({
                                            autoLoad : false,
                                            fields : ['id','label','desc','manuscript_id','obo_def','obo_id'],
                                            idProperty:'id',
                                            data: [
                                                {id: '',label:''}
                                            ],
                                            storeId:'cell_combo_store'
                                        }),
                                        valueField:'id',
                                        hideLabel:true,
                                        displayField:'label',
                                        width : 155,
                                        listWidth : 220,
                                        tabIndex : 0,
                                        typeAhead : true,
                                        selectOnFocus:true,
                                        triggerAction : 'all',
                                        forceSelection : true,
                                        emptyText : 'Select a Cell Type...'
                                    }
                                ]
                            },{
                                xtype:'compositefield',
                                items:[ {
                                    xtype:'button',
                                    text:'Gene',
                                    width:30,
                                    listeners: {
                                        click : function() {
                                            openGeneHeatmapTab();
                                        }
                                    }
                                },
                                    {
                                        xtype:'combo',
                                        id:'gene_combo',
                                        mode:'local',
                                        allowBlank : true,
                                        store: new Ext.data.JsonStore({
                                            autoLoad : false,
                                            fields : ['id','label','pmid_list'],
                                            idProperty:'id',
                                            data: [
                                                {id: '',label:'',pmid_list:''}
                                            ],
                                            storeId:'gene_combo_store'
                                        }),
                                        valueField:'id',
                                        displayField:'label',
                                        hideLabel:true,
                                        tabIndex : 0,
                                        listWidth : 100,
                                        width : 100,
                                        typeAhead : true,
                                        selectOnFocus:true,
                                        triggerAction : 'all',
                                        forceSelection : true,
                                        emptyText : 'Select a Gene...'
                                    }]
                            }//composite field
                        ]
                    },
                    {xtype:'treepanel',
                        id:'heatmap_nav',
                        title: 'Heatmaps',
                        iconCls: 'heatmap',
                        rootVisible: false,
                        lines: false,
                        enableDD : false,
                        animate : false,
                        singleExpand: false,
                        tools: [{
                            id: 'help',
                            handler: function(event, toolEl, panel){
                                openHelpWindow('Heatmap Selection',heatmapHelpString);
                            }
                        }],
                        useArrows: true,
                        height : 300,
                        padding: '5',
                        autoScroll: true,
                        loader: new Ext.tree.TreeLoader({preloadChildren: true}),
                        root: new Ext.tree.TreeNode({
                            expanded: true,
                            draggable:false,
                            allowChildren : true,
                            text:'root',
                            id:'root'
                        }),
                        listeners : {
                            click : function(selected_node) {
                                if (selected_node.isLeaf()) {
                                    Ext.getCmp('center-panel').layout.setActiveItem(selected_node.id);
                                    populateDetails(selected_node.parentNode.id,parseInt(selected_node.id.split('_')[2]));
                                }
                            }
                        }
                    }]
            },
            { region:'center',
                id:'center-panel', name:'center-panel',
                xtype:'panel',
                layout: 'card',
                border:false,
                closable:false,
                enableTabScroll : true,
                activeItem:0,
                height: 800,
                margins: '0 5 5 0',
                items:[{
                    id:'homepage-panel',
                    iconCls:'home',
                    layout: 'fit',
                    autoScroll : true,
                    autoLoad : {
                        url : 'home_tab.html'
                    },
                    title: 'Home'
                }
                ]
            }
        ],
        listeners : {
            afterrender : function() { loadComboStores();setupNavTree();}
        },
        renderTo:Ext.getBody()
    });

    trel.details_window = new Ext.Window({
        id:'details_panel',
        title:'Details',
        renderTo    : 'center-panel',
//                iconCls:'details',
        modal       : true,
        closeAction : 'hide',
        layout      : 'fit',
        width       : 600,
        height      : 500,
        closable    : true,
        layoutConfig : {
            animate : true
        },
        maximizable : false,
        items:[
            {
                xtype:'panel',
                id:'info_panel',
                layout:'auto',
                autoScroll : true,
                style : {fontSize:'10pt'},
                border: false
            }
        ]
    });
    trel.details_window.hide();

    trel.cell_info_window = new Ext.Window( {
        id:'cell_info_panel',
        title:'Cell Info',
        renderTo: 'center-panel',
        modal: false,
        closeAction : 'hide',
        layout:'fit',
        width:700,
        height:600,
        closable : true,
        maximizable : true,
        items: {
            xtype:'grid',
            id:'cell_info_grid',
            autoScroll : true,
            border : false,
            loadMask:true,
            monitorResize: true,
            cm : new Ext.grid.ColumnModel({
                columns: [
                    {header : "Id", width:40, id:'id', dataIndex:'id'},
                    { header: "Label", width: 170,  id:'label', dataIndex:'label'},
                    { header: "Definition", width: 140, id: 'obo_def',dataIndex:'obo_def'},
                    { header: "Manuscript ID", width:120 , id:'manuscript_id', dataIndex:'manuscript_id'},
                    { header: "OBO ID", width:120, id:'obo_id',dataIndex:'obo_id'},
                    { header: "Description", width: 380, id: 'desc',dataIndex:'desc'}
                ],
                defaults: {
                    sortable: true,
                    width: 100
                }
            }),
            store : new Ext.data.JsonStore({
                autoLoad:true,
                sortInfo: { field: "id", direction: "ASC" },
                storeId:'cell_info_grid_store',
                idProperty:'id',
                proxy: new Ext.data.HttpProxy({
                    url: '/google-dsapi-svc/addama/datasources/gp/cell_info' +
                        '/query?tq=select `cell_id`, `label`,`desc`,`manuscript_id`, `obo_id`, `obo_def` order by `label` ASC label `cell_id` \'id\'' +
                        '&tqx=out:json_array'
                }),
                fields : ['id','label','obo_def','manuscript_id','obo_id','desc']
            }),
            listeners : {
                rowclick: function(grid,rowIndex,event) {
                    var record = grid.getStore().getAt(rowIndex);
                    var id = record.json.id;
                    populateDetails('cell',id);
                    showDetailsWindow();
                }
            }
        }
    });
    trel.cell_info_window.hide();

    trel.epiland_window = new Ext.Window( {
            id:'epiland_panel',
            title:'Epigenetic Landscape',
            renderTo: 'center-panel',
            modal: false,
            collapsible:true,
            closeAction : 'hide',
            layout:'fit',
            width:700,
            height:600,
            closable : true,
            maximizable : true,
            items:{
                xtype:'container',
            items: [
                {xtype:'compositefield',
                height:35,
                items:[
                {xtype:'checkbox',
                boxLabel:'Selection Mode',
                labelStyle:'font-size:18px;font-weight:bold',
                height:25,
                handler: toggleSelectActive                
                },
                {xtype:'button',
                height: 25,
                width:80,
                style:'font-size:20px;font-weight:bold',
                text:'Add To List',
                handler:addTopoListHandler
            }
                ]
            },
                {xtype:'container',
                height:'100%',
                xtype:'container',
                id:'epi_panel_map',                
                listeners : {
                    resize : function(p,w,h) {
                        epi.resize(p.getWidth(),p.getHeight());
                    },
                    show: function(p) {
                        epi.resize(p.getWidth(),p.getHeight())
                    }
                }
            }
            ]}        
        });
    trel.epiland_window.hide();

    trel.gene_heatmap_gallery = new Ext.Window({
        id:'gene_heatmap_gallery',
        title:'Gene Gallery',
        //             iconCls:'gallery',
        padding: 5,
        x:100,
        y:150,
        renderTo:'center-panel',
        modal: false,
        closeAction : 'hide',
        closable: true,
        maximizable: true,
        width: 420,
        height: 520,
        layout: 'fit',
        items: { xtype:'panel',
            border : false,
            autoScroll:true,
            items: new Ext.DataView({
                blockRefresh : true,
                store:gallery_store,
                tpl: gene_tpl,
                autoHeight : true,
                mode:'local',
                id:'heatmap_gallery',
                multiSelect : false,
                overClass:'x-item-over',
                itemSelector:'div.thumb-wrap',
                emptyText:'Cell type not found',
                listeners: {
                    click: function(view, index) {
                        var label = view.getStore().getAt(index).get('label');
                        openGenesByLabel(label);
                    }
                }
            })
        }
    });
    trel.gene_heatmap_gallery.hide();

    epi.init('epi_panel_map');

});

function openHelpWindow(subject,text) {
    if (trel.helpWindowReference == null || trel.helpWindowReference.closed) {
        trel.helpWindowReference = window.open('','help-popup','width=400,height=300,resizable=1,scrollbars=1,status=0,'+
            'titlebar=0,toolbar=0,location=0,directories=0,menubar=0,copyhistory=0');
    }
    trel.helpWindowReference.document.title='Help - ' + subject;
    trel.helpWindowReference.document.body.innerHTML = '<b>' + subject +'</b><p><div style=width:350>' + text + '</div>';
    trel.helpWindowReference.focus();
}

function openBrowserWindow(url,width,height) {
    var w = width || 640, h = height || 480;
    window.open(url,'help-popup','width='+w+',height='+h+',resizable=1,scrollbars=1,status=0,'+
        'titlebar=0,toolbar=0,location=0,directories=0,menubar=0,copyhistory=0');
}

function addTopoListHandler(){
    if (epi.selectionList === undefined || epi.selectionList.length < 1) {return;}
    openCellsByLabel(epi.selectionList);
}

function openBrowserTab(url) {
    var new_window = window.open(url,'_blank');
    new_window.focus();
}

var heatmapHelpString = 'The Heatmap panel allows you to navigate through the set of heatmaps that have already been loaded.  <br/>' +
    'Both Gene and Cell Type heatmaps can be accessed through the tree panel.  Click on the desired data to bring up the heatmap.',
    geneLookupHelpString = 'This is the Gene selection panel.  All of the genes included in this study are provided in the dropdown list.' +
        ' To view the results of the analysis, select a gene in the list either by scrolling through the list or by typing the label and selecting the ' +
        'desired gene.  Click the \"Lookup\" button to bring up a heatmap of the results.',
    celltypeLookupHelpString = 'This is the Lookup panel.  All of the cell types and genes included in this study are provided in the dropdown list.' +
        ' To view the results of the analysis, select a cell type or gene in the list either by scrolling through the list or by typing the label and selecting the ' +
        'desired cell types.  Click the \"Lookup\" button to bring up a heatmap of the results.',
    legendHelpString = 'This panel displays the color scale used in each of the heatmaps displayed in this application.',
    detailsHelpString = 'This panel displays detailed information about the cell type or gene which was last selected.',
    toolsHelpString = 'This panel offers other tools relating to the Epigenetic Landscape effort.<br>' +
        'It may be necessary to modify your Java settings in order to use the 3D Landscape Viewer.  Be aware that login windows may open behind the browser' +
        'window.  Move the browser window to find such login screens.';