import buildThread from '../build-thread';
import * as metadata from '../annotation-metadata';

// Fixture with two top level annotations, one note and one reply
const SIMPLE_FIXTURE = [
  {
    id: '1',
    text: 'first annotation',
    $tag: '1',
    references: [],
  },
  {
    id: '2',
    $tag: '2',
    text: 'second annotation',
    references: [],
  },
  {
    id: '3',
    $tag: '3',
    text: 'third annotation',
    references: [1],
  },
];

const defaultBuildThreadOpts = {
  expanded: {},
  forcedVisible: [],
  selected: [],
};

/**
 * Filter a Thread, keeping only properties in `keys` for each thread.
 *
 * @param {Thread} thread - Annotation thread generated by buildThread()
 * @param {Array<string>} keys - The keys to retain
 */
function filter(thread, keys) {
  const result = {};
  keys.forEach(function (key) {
    if (key === 'children') {
      result[key] = thread[key].map(function (child) {
        return filter(child, keys);
      });
    } else {
      result[key] = thread[key];
    }
  });
  return result;
}

/**
 * Threads a list of annotations and removes keys from the resulting Object
 * which do not match `keys`.
 *
 * @param {Array<Annotation>} fixture - List of annotations to thread
 * @param {Object?} opts - Options to pass to buildThread()
 * @param {Array<string>?} keys - List of keys to keep in the output
 */
function createThread(fixture, options, keys) {
  const opts = { ...defaultBuildThreadOpts, ...options };
  keys = keys || [];

  const rootThread = filter(
    buildThread(fixture, opts),
    keys.concat(['annotation', 'children'])
  );
  return rootThread.children;
}

describe('sidebar/util/build-thread', () => {
  describe('threading', () => {
    it('arranges parents and children as a thread', () => {
      const thread = createThread(SIMPLE_FIXTURE);
      assert.deepEqual(thread, [
        {
          annotation: SIMPLE_FIXTURE[0],
          children: [
            {
              annotation: SIMPLE_FIXTURE[2],
              children: [],
            },
          ],
        },
        {
          annotation: SIMPLE_FIXTURE[1],
          children: [],
        },
      ]);
    });

    it('threads nested replies', () => {
      const NESTED_FIXTURE = [
        {
          id: '1',
          references: [],
        },
        {
          id: '2',
          references: ['1'],
        },
        {
          id: '3',
          references: ['1', '2'],
        },
      ];

      const thread = createThread(NESTED_FIXTURE);
      assert.deepEqual(thread, [
        {
          annotation: NESTED_FIXTURE[0],
          children: [
            {
              annotation: NESTED_FIXTURE[1],
              children: [
                {
                  annotation: NESTED_FIXTURE[2],
                  children: [],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('handles loops implied by the reply field', () => {
      const LOOPED_FIXTURE = [
        {
          id: '1',
          references: ['2'],
        },
        {
          id: '2',
          references: ['1'],
        },
      ];

      const thread = createThread(LOOPED_FIXTURE);
      assert.deepEqual(thread, [
        {
          annotation: LOOPED_FIXTURE[1],
          children: [
            {
              annotation: LOOPED_FIXTURE[0],
              children: [],
            },
          ],
        },
      ]);
    });

    it('handles annotations that have their own ID in their `references` list', () => {
      const fixture = [
        { id: '1', references: ['1'] },
        { id: '2', references: ['1'] },
        { id: '3', references: ['1', '3'] },
      ];
      const thread = createThread(fixture);
      assert.deepEqual(thread, [
        {
          annotation: {
            id: '1',
            references: ['1'],
          },
          children: [
            {
              annotation: {
                id: '2',
                references: ['1'],
              },
              children: [],
            },
            {
              annotation: {
                id: '3',
                references: ['1', '3'],
              },
              children: [],
            },
          ],
        },
      ]);
    });

    it('handles missing parent annotations', () => {
      const fixture = [
        {
          id: '1',
          references: ['3'],
        },
      ];
      // Get the threads with `id` key included
      const thread = createThread(fixture, {}, ['id']);
      // It should create a thread with an id of the missing annotation (3)
      assert.deepEqual(thread, [
        {
          id: '3',
          annotation: undefined,
          children: [{ id: '1', annotation: fixture[0], children: [] }],
        },
      ]);
    });

    it('handles missing replies', () => {
      const fixture = [
        {
          id: '1',
          references: ['3', '2'],
        },
        {
          id: '3',
        },
      ];
      const thread = createThread(fixture);
      assert.deepEqual(thread, [
        {
          annotation: fixture[1],
          children: [
            {
              annotation: undefined,
              children: [
                {
                  annotation: fixture[0],
                  children: [],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('threads and sorts new annotations which have tags but not IDs', () => {
      const fixture = [
        {
          $tag: 't1',
        },
        { $tag: 't5' },
        { $tag: 't2' },
        { $tag: 't9', references: ['foo'] },
      ];
      const thread = createThread(fixture);
      assert.deepEqual(thread[0], { annotation: fixture[0], children: [] });
      // Default sort is by tag, so `t2` before `t5`
      assert.deepEqual(thread[1], { annotation: fixture[2], children: [] });
      // It creates a "headless" thread for the annotation with a missing reference
      assert.isUndefined(thread[3].annotation);
    });

    it('threads new replies which have tags but not IDs', () => {
      const fixture = [
        {
          id: '1',
          $tag: 't1',
        },
        {
          $tag: 't2',
          references: ['1'],
        },
      ];
      const thread = createThread(fixture, {}, ['parent']);
      assert.deepEqual(thread, [
        {
          annotation: fixture[0],
          children: [
            {
              annotation: fixture[1],
              children: [],
              parent: '1',
            },
          ],
          parent: undefined,
        },
      ]);
    });
  });

  describe('collapsed state', () => {
    it('collapses top-level annotations by default', () => {
      const thread = buildThread(SIMPLE_FIXTURE, defaultBuildThreadOpts);
      assert.isTrue(thread.children[0].collapsed);
    });

    it('expands replies by default', () => {
      const thread = buildThread(SIMPLE_FIXTURE, defaultBuildThreadOpts);
      assert.isFalse(thread.children[0].children[0].collapsed);
    });

    it('expands threads which have been explicitly expanded', () => {
      const opts = { ...defaultBuildThreadOpts, expanded: { 1: true } };

      const thread = buildThread(SIMPLE_FIXTURE, opts);

      assert.isFalse(thread.children[0].collapsed);
    });

    it('collapses replies which have been explicitly collapsed', () => {
      const opts = { ...defaultBuildThreadOpts, expanded: { 3: false } };

      const thread = buildThread(SIMPLE_FIXTURE, opts);

      assert.isTrue(thread.children[0].children[0].collapsed);
    });

    it('expands threads with visible children', () => {
      // Simulate performing a search which only matches the top-level
      // annotation, not its reply, and then clicking
      // 'View N more in conversation' to show the complete discussion thread
      const opts = {
        ...defaultBuildThreadOpts,
        filterFn: annot => annot.text.match(/first/),
        forcedVisible: ['3'],
      };

      const thread = buildThread(SIMPLE_FIXTURE, opts);

      assert.isFalse(thread.children[0].collapsed);
    });
  });

  describe('filtering', () => {
    context('when there is an active filter', () => {
      it('shows only annotations that match the filter', () => {
        const threads = createThread(
          SIMPLE_FIXTURE,
          {
            filterFn: annot => annot.text.match(/first/),
          },
          ['visible']
        );
        assert.deepEqual(threads, [
          {
            annotation: SIMPLE_FIXTURE[0],
            children: [
              {
                annotation: SIMPLE_FIXTURE[2],
                children: [],
                visible: false,
              },
            ],
            visible: true,
          },
        ]);
      });

      it('shows threads containing replies that match the filter', () => {
        const threads = createThread(
          SIMPLE_FIXTURE,
          {
            filterFn: annot => annot.text.match(/third/),
          },
          ['visible']
        );
        assert.deepEqual(threads, [
          {
            annotation: SIMPLE_FIXTURE[0],
            children: [
              {
                annotation: SIMPLE_FIXTURE[2],
                children: [],
                visible: true,
              },
            ],
            visible: false,
          },
        ]);
      });
    });

    context('when there is a selection', () => {
      it('shows only selected annotations', () => {
        const thread = createThread(SIMPLE_FIXTURE, {
          selected: ['1'],
        });
        assert.deepEqual(thread, [
          {
            annotation: SIMPLE_FIXTURE[0],
            children: [
              {
                annotation: SIMPLE_FIXTURE[2],
                children: [],
              },
            ],
          },
        ]);
      });

      it('shows forced-visible annotations, also', () => {
        const thread = createThread(SIMPLE_FIXTURE, {
          selected: ['1'],
          forcedVisible: ['2'],
        });
        assert.deepEqual(thread, [
          {
            annotation: SIMPLE_FIXTURE[0],
            children: [
              {
                annotation: SIMPLE_FIXTURE[2],
                children: [],
              },
            ],
          },
          {
            annotation: SIMPLE_FIXTURE[1],
            children: [],
          },
        ]);
      });
    });

    describe('thread filtering', () => {
      const fixture = [
        {
          id: '1',
          text: 'annotation',
          target: [{ selector: {} }],
        },
        {
          id: '2',
          text: 'note',
          target: [{ selector: undefined }],
        },
      ];

      it('shows only annotations matching the thread filter', () => {
        const thread = createThread(fixture, {
          threadFilterFn: thread => metadata.isPageNote(thread.annotation),
        });

        assert.deepEqual(thread, [
          {
            annotation: fixture[1],
            children: [],
          },
        ]);
      });
    });
  });

  describe('sort order', () => {
    const annots = threads => threads.map(thread => thread.annotation);

    it('sorts top-level annotations using the comparison function', () => {
      const fixture = [
        {
          id: '1',
          updated: 100,
          references: [],
        },
        {
          id: '2',
          updated: 200,
          references: [],
        },
      ];

      const thread = createThread(fixture, {
        sortCompareFn: (a, b) => b.annotation.updated - a.annotation.updated,
      });

      assert.deepEqual(annots(thread), [fixture[1], fixture[0]]);
    });

    it('sorts replies by creation date', () => {
      const fixture = [
        {
          id: '1',
          references: [],
          updated: 0,
        },
        {
          id: '3',
          references: ['1'],
          created: 100,
        },
        {
          id: '2',
          references: ['1'],
          created: 50,
        },
      ];
      const thread = createThread(fixture, {
        sortCompareFn: (a, b) => b.annotation.id - a.annotation.id,
      });
      assert.deepEqual(annots(thread[0].children), [fixture[2], fixture[1]]);
    });
  });

  describe('reply counts', () => {
    it('populates the reply count field', () => {
      assert.deepEqual(createThread(SIMPLE_FIXTURE, {}, ['replyCount']), [
        {
          annotation: SIMPLE_FIXTURE[0],
          children: [
            {
              annotation: SIMPLE_FIXTURE[2],
              children: [],
              replyCount: 0,
            },
          ],
          replyCount: 1,
        },
        {
          annotation: SIMPLE_FIXTURE[1],
          children: [],
          replyCount: 0,
        },
      ]);
    });
  });

  describe('depth', () => {
    it('is 0 for annotations', () => {
      const thread = createThread(SIMPLE_FIXTURE, {}, ['depth']);
      assert.deepEqual(thread[0].depth, 0);
    });

    it('is 1 for top-level replies', () => {
      const thread = createThread(SIMPLE_FIXTURE, {}, ['depth']);
      assert.deepEqual(thread[0].children[0].depth, 1);
    });
  });
});
