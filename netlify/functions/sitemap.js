exports.handler = async function handler(event) {
  const page = event.queryStringParameters?.page || '1';
  const target = `https://www.spartanburgregional.com/default/sitemap.xml?page=${encodeURIComponent(page)}`;

  try {
    const response = await fetch(target, {
      headers: {
        'user-agent': 'srhs-chatbot-netlify-function/1.0',
        accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=300',
        },
        body: JSON.stringify({ error: 'Unable to fetch sitemap source' }),
      };
    }

    const xml = await response.text();

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
      body: xml,
    };
  } catch {
    return {
      statusCode: 502,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ error: 'Sitemap proxy failed' }),
    };
  }
};
