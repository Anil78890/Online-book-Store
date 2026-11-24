import InfoPage from './InfoPage';

const Privacy = () => (
  <InfoPage
    eyebrow="Privacy Policy"
    title="Privacy Policy"
    intro="BlueLeaf Books is designed to be privacy-conscious. This policy describes the current local-only behavior and the requirements before adding analytics, newsletter, or accounts."
    sections={[
      {
        heading: 'Data stored locally',
        body: ['Your saved reading library and reader settings are stored in your browser localStorage. They are not sent to BlueLeaf Books servers by this frontend app.'],
      },
      {
        heading: 'External source requests',
        body: ['Searches and book loads request data from Gutendex, Project Gutenberg, Open Library, and Open Library cover services. Those services may receive standard request information from your browser.'],
      },
      {
        heading: 'Newsletter and analytics',
        body: ['Newsletter capture is disabled until a compliant provider is connected. Analytics should not be enabled until this policy is updated with the provider, purpose, retention, and opt-out details.'],
      },
      {
        heading: 'Data requests',
        body: ['This release does not provide user accounts or a remote profile. To remove saved books, highlights, notes, analytics and reader preferences stored by this site, clear this site’s browser storage. A monitored privacy contact will be published before remote user-data features are introduced.'],
      },
    ]}
  />
);

export default Privacy;
