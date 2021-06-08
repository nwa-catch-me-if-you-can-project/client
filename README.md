![Hypothesis custom tags icon](/images/hypothesis_icon_custom_tags.png){ width=40% }

Hypothesis Custom Tags client
=============================

[![Continuous integration](https://github.com/hypothesis/client/workflows/Continuous%20integration/badge.svg?branch=master)][gha]
[![npm version](https://img.shields.io/npm/v/hypothesis.svg)][npm]
[![BSD licensed](https://img.shields.io/badge/license-BSD-blue.svg)][license]

[gha]: https://github.com/hypothesis/client/actions?query=branch%3Amaster
[npm]: https://www.npmjs.com/package/hypothesis
[license]: https://github.com/hypothesis/client/blob/master/LICENSE

The Hypothesis client is a browser-based tool for making annotations on web
pages. It’s a client for the [Hypothesis web annotation service][service].
It’s used by the [Hypothesis browser extension][ext], and can also be
[embedded directly into web pages][embed].

The Hypothesis Custom Tags extension adds the feature of importing custom 
annotation tags from an input CSV file, either from a remote URL on the Web
or from a local file.

![Screenshot of Hypothesis custom tags client](/images/interface-with-labels.png?raw=true)

The input CSV file required should follow the following specification:

![Hypothesis custom tags input file format](/images/inputfileformat.png?raw=true)

Screenshot of the Custom Tags annotation panel:

![Hypothesis custom tags panel screenshot](/images/custom-tags-panel.png?raw=true)

Screenshot of the Custom Tags autocomplete dropdown with different
text colors for tag types and descriptive tooltips for tags:

![Hypothesis custom tags add annotation tags panel screenshot](/images/add-annotations-panel.png?raw=true)

[service]: https://github.com/hypothesis/h
[ext]: https://chrome.google.com/webstore/detail/hypothesis-web-pdf-annota/bjfhmglciegochdpefhhlphglcehbmek
[embed]: https://h.readthedocs.io/projects/client/en/latest/publishers/embedding/

Development
-----------

See the client [Development Guide][developers] for instructions on building,
testing and contributing to the client.

[developers]: https://h.readthedocs.io/projects/client/en/latest/developers/

Community
---------

See our [Contact page to join us on Slack](https://web.hypothes.is/contact/), or
[log in once you've already created an account](https://hypothesis-open.slack.com/).

If you'd like to contribute to the project, you should consider subscribing to
the [development mailing list][ml], where we can help you plan your
contributions.

Please note that this project is released with a [Contributor Code of
Conduct][coc]. By participating in this project you agree to abide by its terms.

[ml]: https://groups.google.com/a/list.hypothes.is/g/dev
[coc]: https://github.com/hypothesis/client/blob/master/CODE_OF_CONDUCT

License
-------

All of the license information for the Hypothesis Custom Tags extension
can be found in the included [LICENSE][license] file.

[bsd2c]: http://www.opensource.org/licenses/BSD-2-Clause
[license]: https://github.com/nwa-catch-me-if-you-can-project/client/blob/master/LICENSE
