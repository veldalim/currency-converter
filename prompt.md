# Prompts Log

This document records the user prompts provided during the development of the **SingaRate - Real-time & Offline SGD Currency Converter** application.

---

### Prompt 1: Initial Application Build (Frontend)

```text
create an app to help users convert foreign currencies into Singapore dollars in real-time with an intuitive, minimalist interface and offline exchange rate support.

build just the front end for now, i will include the backend connection later.
```

---

### Prompt 2: Initial Git Push Attempt

```text
git push https://<GITHUB_TOKEN>@github.com/veldalim/bus-arrival-LTA.git
```

---

### Prompt 3: Git Push to Currency Converter Repository

```text
git push https://<GITHUB_TOKEN>@github.com/veldalim/currency-converter.git
```

---

### Prompt 4: CurrencyPickerModal Search & Category Filtering

```text
Enhance the CurrencyPickerModal with a search bar and category filtering (e.g., 'Favorites', 'Asia', 'Europe') to help users quickly find currencies in a long list.
```

---

### Prompt 5: Singapore Exchange Rates & MAS Quoting Standards Frontend

```text
1. build a Singapore-based exchange rate toll that provides real-time currency conversions for the SG currencies.

2. build just the front end for now. i will add the backend integration using MAS API keys later. Use a clean UI with search, favorites, and a simple calculator.
```

---

### Prompt 6: Push to GitHub Repository

```text
git push https://<GITHUB_TOKEN>@github.com/veldalim/currency-converter.git
```

---

### Prompt 7: Serverless MAS API Integration (/api/health.ts and /api/exchangerates.ts)

```text
1. add a serverless API connection that pulls live data from MAS API catalogue using the following endpoint:

GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14
# KeyId: <MAS_KEY_ID>
2. store this in /api folder at the project root level not the src folder
3. include /health.ts and /exchangerates.ts within the same subfolder
4. do not hardcode any API key, i will manually include them
```

---

### Prompt 8: Push to GitHub Repository

```text
git push https://<GITHUB_TOKEN>@github.com/veldalim/currency-converter.git
```

---

### Prompt 9: Embed Disqus Forum "Talk to us" Tab

```text
create a tab "Talk to us" and embed a disqus forum using the following:
import { DiscussionEmbed } from 'disqus-react';

1. Discussion Embed:
<DiscussionEmbed
    shortname='exchange-rate-mas'
    config={
        {
            url: this.props.article.url,
            identifier: this.props.article.id,
            title: this.props.article.title,
            language: 'en'
        }
    }
/>

2. Comment Count:
import { CommentCount } from 'disqus-react';

<CommentCount
    shortname='exchange-rate-mas'
    config={
        {
            url: this.props.article.url,
            identifier: this.props.article.id,
            title: this.props.article.title,
        }
    }
>
    {/* Placeholder Text */}
    Comments
</CommentCount>

3. Single Sign-On (SSO)
import { DiscussionEmbed } from 'disqus-react';

<DiscussionEmbed
    shortname='exchange-rate-mas'
    config={
        {
            url: this.props.article.url,
            identifier: this.props.article.id,
            title: this.props.article.title,
            language: 'en',
            remoteAuthS3: '',
            apiKey: '', 
            sso: {
                name: 'SampleNews',
                button: 'http://example.com/images/samplenews.gif',
                icon: 'http://example.com/favicon.png',
                url: 'http://example.com/login/',
                logout: 'http://example.com/logout/',
                profile_url: 'http://example.com/profileUrlTemplate/{username}',
                width: '800',
                height: '400',
            }
        }
    }
/>
```




