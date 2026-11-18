# Customer Management Operations Settings Pages

Route-page components for Customer Hub operational settings live here. Settings behavior and
workspace components remain in `src/features/service`.

- `ServiceSettingsPage.jsx`: settings workspace at
  `/customer-management/service/settings/:section?`; the base route opens
  `/customer-management/service/settings/health`. `/customer-management/service/settings/:section?` is not registered.
  `/customer-management/tickets/settings/:section?` remains as a compatibility route.
