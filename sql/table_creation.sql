-- Create syntax for '(null)'

-- Create syntax for TABLE 'cell_info'
CREATE TABLE `cell_info` (
  `cell_id` int(11) NOT NULL auto_increment,
  `label` varchar(255) NOT NULL,
  `manuscript_id` varchar(40) NOT NULL,
  `desc` mediumtext NOT NULL,
  `obo_id` varchar(255) NOT NULL,
  `obo_def` mediumtext NOT NULL,
  `obo_desc` mediumtext NOT NULL,
  PRIMARY KEY  (`cell_id`)
) ENGINE=MyISAM AUTO_INCREMENT=167 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'cell_names'
CREATE TABLE `cell_names` (
  `id` int(11) NOT NULL auto_increment,
  `label` varchar(255) NOT NULL,
  `pmid_list` varchar(255) default NULL,
  PRIMARY KEY  (`id`),
  KEY `id` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=167 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'cl_genes'
CREATE TABLE `cl_genes` (
  `entrez_id` int(11) NOT NULL,
  `gene_label` varchar(255) NOT NULL,
  PRIMARY KEY  (`entrez_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'entrez_gene'
CREATE TABLE `entrez_gene` (
  `gene_label` varchar(255) NOT NULL,
  `entrez_id` int(11) NOT NULL,
  PRIMARY KEY  (`entrez_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'gene_ids'
CREATE TABLE `gene_ids` (
  `entrez_id` int(11) NOT NULL,
  `gene_label` varchar(255) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'gene_pmid'
CREATE TABLE `gene_pmid` (
  `entrez_id` int(11) NOT NULL,
  `category` varchar(255) default NULL,
  `evidence` varchar(255) default NULL,
  `ev_level` int(11) default NULL,
  `probe` int(11) default NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'mv_gene_pmid'
CREATE TABLE `mv_gene_pmid` (
  `entrez_id` int(11) NOT NULL,
  `gene_label` varchar(255) NOT NULL,
  `pmid_list` varchar(255) default NULL,
  PRIMARY KEY  (`entrez_id`),
  KEY `gene_label` (`gene_label`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'mv_part_cells'
CREATE TABLE `mv_part_cells` (
  `cellname_id` int(11) NOT NULL,
  `entrez_id` int(11) NOT NULL,
  `sum_score` float NOT NULL,
  `gene_label` varchar(255) NOT NULL,
  `cell_matrix` longtext NOT NULL,
  PRIMARY KEY  (`cellname_id`,`entrez_id`),
  KEY `query` (`cellname_id`,`sum_score`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'participation_cells'
CREATE TABLE `participation_cells` (
  `cellname_id` int(11) NOT NULL,
  `entrez_id` int(11) NOT NULL,
  `sum_score` float NOT NULL,
  `cell_matrix` longtext NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'participation_genes'
CREATE TABLE `participation_genes` (
  `entrez_id` int(11) NOT NULL,
  `gene_matrix` longtext NOT NULL,
  PRIMARY KEY  (`entrez_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'participation_scores'
CREATE TABLE `participation_scores` (
  `entrez_id` int(11) NOT NULL,
  `score_matrix` longtext NOT NULL,
  PRIMARY KEY  (`entrez_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
