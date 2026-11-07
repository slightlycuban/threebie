# Tests

These tests let the demo be restructured and upgraded without checking it by
eye. They pin what each page renders and how the ripple moves, so any change in
behavior shows up as a failing snapshot.

```sh
npm test                 # both of the below
npm run test:unit        # ripple simulation, in Node
npm run test:unit:update # re-record its expected heights after an intended change
npm run test:e2e         # the page in headless Chromium, against the snapshots
npm run test:e2e:update  # re-record the snapshots after an intended change
npm run record           # real-time video of each demo, in test-results/
```

The snapshots record current behavior, known bugs included. A change meant to
alter behavior updates them in the same commit. A change that isn't must leave
them untouched.

CI runs `npm test` in the Playwright container whose version matches
`package.json`, so it renders with the same Chromium the snapshots were
recorded with.
