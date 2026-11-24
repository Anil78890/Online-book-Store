import InfoPage from './InfoPage';

const Contact = () => (
  <InfoPage
    eyebrow="Contact"
    title="Contact BlueLeaf Books"
    intro="BlueLeaf Books is an independent reading project. This release does not yet have a monitored support inbox or contact form, so we do not publish an address that may not be checked."
    sections={[
      {
        heading: 'Book and catalogue corrections',
        body: ['BlueLeaf displays catalogue records and public-domain text from external sources. For a correction to an original catalogue record or digitised text, visit the relevant provider listed on the Data Sources page.'],
      },
      {
        heading: 'Privacy and local data',
        body: ['Your saved reading list and reader preferences are stored in your browser. You can remove them by clearing this site’s storage in your browser settings. No BlueLeaf account is required.'],
      },
      {
        heading: 'Project feedback',
        body: ['A monitored feedback channel will be added when an official support mailbox is configured.'],
      },
    ]}
  />
);

export default Contact;
