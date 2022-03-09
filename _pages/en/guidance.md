---
title: Technical instructions
permalink: /en/guidance/
layout: page
language: en
---
## Open source project on GitHub

The DNS online platform is a publicly accessible tool for the dissemination and presentation of German data for the indicators of the German Sustainable Development Strategy.

## Sources

The Federal Statistical Office (Destatis) actively supports the development of national online platforms, in particular as open source solutions for the presentation of DNS indicators. Pioneers in this area are the USA and Great Britain. The current version of the German online platform was developed on the basis of an earlier version of the British online platform and adapted to the needs of German statistics. The project code for the DNS online platform is publicly available in the [GitHub repository](https://github.com/sustainabledevelopment-deutschland/sustainabledevelopment-deutschland.github.io).

A universal version of the codes for an online platform developed by the United States, Great Britain and the Center for Open Data Enterprise is available. The DNS online platform is based on this. If you are interested, we recommend that you familiarise yourself with the SDG online platforms of the United States and Great Britain and the relevant [Open SDG project documentation](https://open-sdg.readthedocs.io/en/latest/). This contains technical instructions on how to make a copy of the Open SDG online platform.

- [SDG online platform of the United States](https://sdg.data.gov/)
- [SDG online platform of Great Britain](https://sustainabledevelopment-uk.github.io/)

If you have comments or feedback on the Open SDG project or would like to participate in the Open SDG community, please contact [Open SDG GitHub](https://github.com/open-sdg/open-sdg/issues).

## Applied technology

### Back-end IT requirements:
- GitHub: hosting of the website designed for programming projects using the Git version control system
- Jekyll: generator for static pages written in Ruby

### Front-end IT requirements:
- XHTML, CSS, JavaScript
- Chartist: JavaScript Library
- Bootstrap: framework CSS

## Current presentation

The current version of the DNS online platform contains some technical issues concerning the presentation of data. These include:<br>
- Whole numbers are displayed without decimal places (also in time series which include other numerical values with decimal places).
- Very long names of time series are not wrapped over several lines and sometimes cut off in graph axis labels.
- If you hover over a data point in the charts, the label and the exact value of this data point are displayed. Subscript and superscript numbers and letters are not correctly shown.
- During the same process the names of the data series are not wrapped.
