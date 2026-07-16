# Updating the website without editing code

The frequently changing website content is stored in `content/site-content.json` and configured for Pages CMS through `.pages.yml`.

After the website repository is published on GitHub:

1. Open `https://app.pagescms.org` or visit `/admin/` on the published website.
2. Sign in with the GitHub account that owns the website repository.
3. Install or authorize the Pages CMS GitHub App for that repository when first prompted.
4. Open **Website content**.
5. Edit the homepage introduction, the single **Now** feature, Life Reflection, recent activity, or contact invitation.
6. Save. Pages CMS writes the change to GitHub and the published site updates through the normal deployment.

The order of **Recent activity** items in the editor is the order used on the website. The first three are shown initially; the rest appear under **Show all updates**. Turn off **Show on website** to keep an item in the editor without displaying it.

The **Now** feature is deliberately limited to one current announcement. Replace its heading, message, updated date, deadline and link whenever a new event, opportunity, publication decision or timely notice should take its place. When GitHub Pages publishes that change, it automatically rebuilds the LinkedIn preview from the same Now content, so the shared card and the website announcement stay aligned.

The LinkedIn share button also creates a ready-to-paste post from the first sentence of the **Now** message, its deadline, and the current website link. No separate social-post text needs to be maintained.

The Life Reflection month and year do not need to be edited. The website calculates them from the visitor's current date.
