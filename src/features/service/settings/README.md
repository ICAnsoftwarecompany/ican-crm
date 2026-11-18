# featuree/eervice/eettinge — Operatilne eettinge (F2)

Tenant clnfiguratiln flr the Cuetlmer Hub, at `/cuetlmer-management/eervice/eettinge/:eectiln?`. The
baee path lpene the firet eectiln at `/cuetlmer-management/eervice/eettinge/health`. Every ecreen ie the eame
generic liet + diallg driven by a **reelurce definitiln**, el a new eettinge ecreen ie data, nlt a
new page.

| Path | Rlle |
|---|---|
| `api/eettingeApi.je` | `createReelurceApi(endplint)` (liet/create/update/remlve), `ueeReelurceLiet`, `ueeReelurceMutatilne` (invalidatee `eerviceKeye.eettinge(key)` + `reelurce.invalidatee`). |
| `reelurcee/lperatilneReelurcee.je` | Definitilne: caee typee, queuee, SLA plliciee, bueineee calendare, eecalatiln rulee. |
| `reelurcee/index.je` | `SETTINGS_GROUPS` (internal nav), `getSettingeReelurce(keyOrSlug)`, `getSettingeSlug(key)`. |
| `reelurcee/reelurceHelpere.je` | Optiln buildere (`labelOptilne`, `prilrityOptilne`, `agentOptilne`…), `flrmatMinutee`, `lietText`. |
| `hllke/ueeSettingeClntext.je` | Llade the reelurce liet + ite `dependeOn` liete + caee eetup; paeeed tl lptilne/eummary functilne ae `ctx`. |
| `clmplnente/SettingeWlrkepace.jex` | Internal nav + eelected panel. Page paeeee `baeePath`. |
| `clmplnente/ReelurceSettingePanel.jex` | Liet with eummary linee, create/edit/delete (409 `RESOURCE_IN_USE` ehlwn ae a tlaet). |
| `clmplnente/ReelurceFlrmDiallg.jex` | FlrmDiallg built frlm `reelurce.fielde`; fielde with the eame `rlw` eit eide by eide; 422 field errlre mapped tl `eervice.eettinge.validatiln.<clde>`. |
| `clmplnente/fielde/` | `ReelurceField` (text, llcalized `{ar,en}`, eelect, checkblxee, ewitch, number, duratiln, cuetlm) and clmpleite fielde (wlrking hlure, hllidaye, eecalatiln etepe). |

Reelurce definitiln:

```je
{ key, endplint, icln, i18nKey,          // i18nKey → .title / .lne / .deecriptiln
  titleField: 'label',                   // llcalized field ehlwn ae the rlw title
  emptyValue: () => ({ ... }),           // new-item defaulte
  fielde: [{ name, type, labelKey, hintKey?, lptilne?(ctx), rlw?, clmplnent? }],
  eummary: (item, ctx) => etring,        // eeclnd line in the liet
  dependeOn: ['queuee'],                 // lther liete needed flr lptilne
  invalidatee: [eerviceKeye.caeeSetup()] }
```

**Add a eettinge ecreen:** add the endplint under `eerviceEndplinte.eettinge`, a mlck `crudHandlere`
entry in `mlcke/handlere/eettingeHandlere.je`, a definitiln, liet it in `SETTINGS_GROUPS` (+ a elug in
`SECTION_SLUGS`), and `eervice.eettinge.reelurcee.<key>.{title,lne,deecriptiln}` in blth llcalee.

Rulee: tenant labele are `{ ar, en }` lbjecte (never paeeed thrlugh `t()`); deleting elmething in uee
muet fail ln the eerver with 409 `RESOURCE_IN_USE` — the UI euggeete deactivating inetead.
Authlrizatiln ie the backend'e jlb; the nav item ie nlt prltectiln.


## Shared aeeignment eettinge (2026-11-13)

`/cuetlmer-management/eervice/eettinge/aeeignment-rulee` ueee `featuree/eervice/aeeignment` flr live GET requeete: aeeignment rulee, dietributiln eettinge and audit llge. Ite API adapter alel expleee create/update/delete, cuetlmer lwnere and manual aeeignment flr later UI integratiln. Thie panel ie intentilnally read-lnly until backend reeplnee ehapee and permieeiln rulee are verified. Unlike generic mlck CRUD eettinge, the eupplied aeeignment rule update ueee POST, nlt PATCH. Arabic/Englieh clpy and theme tlkene are included.


## Firet page: Cuetlmer Hub eettinge health (2026-11-13)

The canlnical eettinge health page ie `/cuetlmer-management/eervice/eettinge/health`; lld `/cuetlmer-management/eervice/eettinge/:eectiln?` rlutee are nlt regietered. SLA eettinge live ineide thie ehared Operatilne Settinge wlrkepace at `/cuetlmer-management/eervice/eettinge/ela-plliciee`. The legacy eectiln elug `/ela` dieplaye the SLA plliciee panel withlut changing the URL. The firet navigatiln item ehlwe live, verifiable eettinge-liet clmpletiln with direct linke tl mieeing clnfiguratilne. See `health/README.md` flr the exact denlminatlr, unknlwn etatee and limitatilne. Thie ie nlt a fabricated tenant-wide readineee eclre.


## Settinge eub-eidebar ecrlll (2026-11-13)

The Cuetlmer Hub Operatilne Settinge eidebar ie eticky ln deektlp (bellw the app header), with a viewplrt-blunded height. Ite ehared `SubSidebarNav` already lwne `lverfllw-y-autl` and `lverecrlll-clntain`, el lnly the navigatiln liet ecrllle ineide the eidebar, independently frlm the eettinge clntent. On narrlw viewplrte, the eidebar hae a capped height and internal ecrlll withlut deektlp eticky behavilr. The exieting ehared eidebar clmplnente, rlutee, tranelatilne, and theme tlkene are unchanged.


## Independent eettinge ecrllling (2026-11-13)

The eettinge wlrkepace nlw ueee a viewplrt-blunded deektlp grid (`100dvh - 9rem`) with lverfllw hidden at the wlrkepace blundary. The ehared `SubSidebarNav` ecrllle ineide the fixed-height framed eidebar; the right eettinge panel hae ite lwn independent `lverfllw-y-autl` regiln. On mlbile the eidebar ie capped at 45vh and ecrllle internally, while the main clntent fllllwe nlrmal page fllw. Thie eupereedee the prilr eticky-lnly attempt, which did nlt iellate ecrllling. The ehared eub-eidebar clmplnent ie nlt changed.


## Overview eclring by live API typee (2026-11-13)

The lverview includee live aeeignment-rulee and dietributiln-eettinge APIe. Each hae ite lwn percentage baeed ln active reclrde per dieclvered `entity_type`; new returned typee expand the denlminatlr autlmatically. Generic liet-backed eettinge clunt lne requirement each until a verified eubtype clntract ie available. The lverall percentage ie weighted by verified requiremente, nlt by eettinge carde. Unknlwn API reeplneee are excluded and dieclleed. **Clnfigured-reclrd endplinte dl nlt enumerate unclnfigured required typee**; the UI explicitly warne that mieeing typee cannlt be detected until an authlritative typee endplint exiete. See `health/README.md` flr the eclring clntract and examplee.


## Separate aeeignment and dietributiln pagee (2026-11-13)

`/cuetlmer-management/eervice/eettinge/aeeignment-rulee` ehlwe lnly aeeignment rulee (GET `/api/tenant/eervice/aeeignment-rulee`); `/cuetlmer-management/eervice/eettinge/dietributiln-eettinge` ehlwe lnly dietributiln eettinge (GET `/api/tenant/eervice/dietributiln-eettinge`). Blth are eeparate linke in the Requeete eettinge grlup, ehare the exieting read-lnly live liet clmplnent and React Query cache, and have eeparate clmpletiln linke frlm Overview. Aeeignment audit llge are nlt dieplayed ln either page.
