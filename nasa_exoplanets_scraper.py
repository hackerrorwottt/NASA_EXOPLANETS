# nasa_exoplanets_scraper.py
"""
Scraper for https://science.nasa.gov/exoplanets/
- Respects robots.txt (simple check)
- Extracts title, meta description, headings (h1-h4), paragraphs, images, links
- Saves JSON to results.json and generates results.html (self-contained viewer)
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import sys
from requests.adapters import HTTPAdapter, Retry

BASE_URL = "https://science.nasa.gov/exoplanets/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; MyScraper/1.0; +https://example.com/bot)",
}


def make_session(retries=3, backoff_factor=0.5, status_forcelist=(429, 500, 502, 503, 504)):
    s = requests.Session()
    retries = Retry(total=retries, backoff_factor=backoff_factor,
                    status_forcelist=status_forcelist,
                    allowed_methods=frozenset(['GET','HEAD']))
    s.mount("https://", HTTPAdapter(max_retries=retries))
    s.mount("http://", HTTPAdapter(max_retries=retries))
    s.headers.update(HEADERS)
    return s


def allowed_by_robots(target_url, session):
    parsed = urlparse(target_url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    try:
        r = session.get(robots_url, timeout=10)
        if r.status_code != 200:
            return True
        text = r.text.splitlines()
        applicable = False
        disallows = []
        for line in text:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if line.lower().startswith('user-agent:'):
                user_agent = line.split(':',1)[1].strip()
                applicable = (user_agent == '*' or 'myscraper' in user_agent.lower())
            elif applicable and line.lower().startswith('disallow:'):
                path = line.split(':',1)[1].strip()
                disallows.append(path)
        if '/' in disallows:
            return False
        return True
    except Exception:
        return True


def fetch(url, session, timeout=15):
    resp = session.get(url, timeout=timeout)
    resp.raise_for_status()
    return resp


def parse_page(html, base_url):
    soup = BeautifulSoup(html, 'html.parser')

    title = soup.title.string.strip() if soup.title and soup.title.string else None
    meta_desc = None
    desc_tag = soup.find('meta', attrs={'name':'description'})
    if desc_tag and desc_tag.get('content'):
        meta_desc = desc_tag['content'].strip()

    main = None
    for candidate in ('main', 'article', 'div#content', 'div#primary', 'div.main-content'):
        main = soup.select_one(candidate)
        if main:
            break
    if not main:
        main = soup.body or soup

    headings = []
    for h in main.find_all(['h1','h2','h3','h4']):
        text = h.get_text(separator=' ', strip=True)
        if text:
            headings.append({'tag': h.name, 'text': text})

    paragraphs = []
    for p in main.find_all('p'):
        txt = p.get_text(separator=' ', strip=True)
        if txt:
            paragraphs.append(txt)

    images = []
    for img in main.find_all('img'):
        src = img.get('src') or img.get('data-src')
        if not src:
            continue
        src = urljoin(base_url, src)
        images.append({'src': src, 'alt': img.get('alt', '')})

    links = []
    for a in main.find_all('a', href=True):
        href = a['href'].strip()
        full = urljoin(base_url, href)
        text = a.get_text(separator=' ', strip=True)
        links.append({'text': text, 'href': full})

    return {
        'url': base_url,
        'title': title,
        'meta_description': meta_desc,
        'headings': headings,
        'paragraphs': paragraphs,
        'images': images,
        'links': links
    }


def generate_html(data, out_file='results.html'):
    # Embed JSON safely into the HTML. Escape </ to avoid closing the script tag early.
    raw_json = json.dumps(data, ensure_ascii=False, indent=2)
    safe_json = raw_json.replace('</', '<\/')

    html = f"""
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>NASA Exoplanets — Scrape Results</title>
      <style>
        body {{ font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin: 24px; max-width: 1000px; }}
        header {{ margin-bottom: 16px; }}
        .meta {{ color: #555; margin-bottom: 12px; }}
        .grid {{ display: grid; grid-template-columns: 1fr 320px; gap: 20px; }}
        .card {{ background: #fff; border-radius: 8px; padding: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); }}
        .images img {{ max-width: 100%; height: auto; display:block; margin-bottom:8px; border-radius:6px; }}
        .links a {{ word-break: break-all; display:block; margin-bottom:6px; }}
        .heading {{ font-weight: 700; margin-top:10px; }}
        details p {{ margin:0 0 10px 0; }}
      </style>
    </head>
    <body>
      <header>
        <h1 id="pageTitle">Scrape results</h1>
        <div class="meta" id="metaDesc"></div>
      </header>

      <div class="grid">
        <div>
          <div class="card">
            <h2>Headings</h2>
            <div id="headings"></div>

            <h2 class="heading">Content (paragraphs)</h2>
            <div id="paragraphs"></div>

            <h2 class="heading">Links</h2>
            <div id="links" class="links"></div>
          </div>
        </div>

        <aside>
          <div class="card">
            <h3>Images</h3>
            <div class="images" id="images"></div>
          </div>
        </aside>
      </div>

      <script>
      // Embedded data from scraper
      var DATA = {safe_json};

      function init() {{
        document.getElementById('pageTitle').textContent = DATA.title || DATA.url;
        document.getElementById('metaDesc').textContent = DATA.meta_description || '';

        var hCont = document.getElementById('headings');
        DATA.headings.forEach(function(h) {{
          var el = document.createElement('div');
          el.textContent = h.tag.toUpperCase() + ': ' + h.text;
          hCont.appendChild(el);
        }});

        var pCont = document.getElementById('paragraphs');
        DATA.paragraphs.forEach(function(p, i) {{
          var d = document.createElement('details');
          var s = document.createElement('summary');
          s.textContent = 'Paragraph ' + (i+1);
          var para = document.createElement('p');
          para.textContent = p;
          d.appendChild(s);
          d.appendChild(para);
          pCont.appendChild(d);
        }});

        var imgCont = document.getElementById('images');
        DATA.images.forEach(function(img) {{
          var a = document.createElement('a');
          a.href = img.src;
          a.target = '_blank';
          var image = document.createElement('img');
          image.src = img.src;
          image.alt = img.alt || '';
          a.appendChild(image);
          imgCont.appendChild(a);
        }});

        var lCont = document.getElementById('links');
        DATA.links.forEach(function(l) {{
          var a = document.createElement('a');
          a.href = l.href;
          a.target = '_blank';
          a.textContent = (l.text || l.href);
          lCont.appendChild(a);
        }});
      }}

      init();
      </script>
    </body>
    </html>
    """.replace('{safe_json}', safe_json)

    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Wrote {out_file}")


def scrape_and_save(url=BASE_URL):
    session = make_session()
    if not allowed_by_robots(url, session):
        print(f"Robots.txt disallows scraping {url}. Aborting.")
        return None

    r = fetch(url, session)
    data = parse_page(r.text, url)

    # Save JSON
    with open('results.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('Saved results.json')

    # Generate self-contained HTML viewer
    generate_html(data, out_file='results.html')

    return data


if __name__ == '__main__':
    try:
        data = scrape_and_save()
        if data is None:
            sys.exit(1)
        print('Done. Open results.html in your browser to view the data.')
    except requests.HTTPError as he:
        print('HTTP error:', he)
    except Exception as e:
        print('Error:', e)
