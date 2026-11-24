import InfoPage from './InfoPage';

const Terms = () => (
  <InfoPage
    eyebrow="Terms of Use"
    title="Terms of Use"
    intro="These terms define BlueLeaf Books as a discovery and reading interface for legally accessible public texts and metadata."
    sections={[
      {
        heading: 'Permitted use',
        body: ['Use the site to search, save, and read books made available through the connected public sources. Do not use the site to upload, request, or distribute pirated content.'],
      },
      {
        heading: 'Source limitations',
        body: ['Project Gutenberg content is presented as public-domain full text. Open Library data is presented as metadata unless its source page provides legal reading access. Availability can change at the external source.'],
      },
      {
        heading: 'No warranties',
        body: ['BlueLeaf Books depends on external APIs and cannot guarantee uninterrupted access, complete metadata, or perfect classification.'],
      },
      {
        heading: 'Attribution',
        body: ['Project Gutenberg, Gutendex, and Open Library are independent public sources. BlueLeaf Books is not endorsed by them unless explicitly stated.'],
      },
    ]}
  />
);

export default Terms;
