# Transcriptional Regulation and Epigenetic Landscape (TREL)

A web interface onto the data published as Heinäniemi, Merja, et al. "Gene-pair expression signatures reveal lineage control." Nature methods 10.6 (2013): 577-583.
Paper can be viewed [here] (http://www.nature.com/nmeth/journal/v10/n6/full/nmeth.2445.html)

# Webapp

Dependencies

* protovis
* visquick 
* extjs 3.4.0
* openlayers

The dependencies can be found at

[release 0.1](https://github.com/IlyaLab/trel/releases/tag/0.1)

visquick and openlayers should be unzipped into the webapp/js folder.  the subfolders will be
visquick-core-1.0
openlayers

3d and extjs should be unzipped into the webapp/ folder.  the subfolders will be
extjs/3.4.0/...
3d/

The underlying data tables are served through a Java Web Application layer (Google Data Service API) that connects to a Mysql backend.

