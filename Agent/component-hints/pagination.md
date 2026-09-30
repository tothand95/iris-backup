# Pagination — Functional Requirements and Hints

## Ellipsis collapses distant pages

When the total number of pages exceeds the maximum number of visible pages, page numbers far from the current page are collapsed into a single ellipsis separator. The first and last pages are always shown. The maximum number of visible middle pages is configurable.

## Navigation buttons disable at the boundaries

The Previous button is disabled when the user is on the first page. The Next button is disabled when the user is on the last page. Disabled navigation buttons are still rendered but cannot be activated.

## Emits a change event

When the user activates a page button or a navigation button, the component emits a change event containing the new page number, the previous page number, the total number of pages, and the reason — `next`, `previous` or `jump` — identifying which control was used. Page numbers are 1-based integers. It does not update the current page internally — the consumer is responsible for reflecting the change back via the current page input.

## Clicking the active page does nothing

Activating the button for the page that is already current produces no output.

## Page existence can be declared instead of counted

A consumer backed by a cursor or keyset source has no total. Binding either of the two page-existence flags makes the component step rather than count: the flags alone decide whether the navigation buttons are enabled, the total input is ignored, and the total reported on the change event is undefined. An unset forward flag means no further page exists — the component never falls back to the total once the flags are in play. Jumping to an arbitrary page is inert, because the consumer has no way to address one. Numbered pages cannot represent such a collection, so this configuration expects the simplified layout.

## Busy state disables the controls

While the busy input is set, every button is disabled and the navigation landmark is marked busy. This absorbs a double click during a page fetch without the consumer having to guard it.

## Position indicator in simplified type

The simplified layout can optionally show where the user is, between the two buttons. It names the current page together with the total when one is known, and the current page alone when it is not. It is a polite live region, so the new position is announced once a page arrives.

## Previous and Next buttons in simplified type

In the simplified layout, the Previous and Next buttons are sized to their content and separated by a comfortable gap.

## Warns about contradictory configuration

In development builds the component warns when a cursor source is combined with numbered pages, when a total is supplied alongside the page-existence flags, when the backward flag is bound without the forward one, and when the simplified layout is left with neither a usable total nor a page-existence flag, which would disable Next permanently.
