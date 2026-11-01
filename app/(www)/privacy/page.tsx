import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";
import { APP_NAME, CONTACT_EMAIL, GITHUB_URL, ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${APP_NAME} handles your notes and data: no account needed, notes stay in your browser, no ads and no tracking.`,
  alternates: { canonical: ROUTES.privacy },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      command="privacy"
      title="Privacy Policy"
      lastUpdated="November 1, 2026"
      summary={
        <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-sky-ink/60">
          <li>You can use {APP_NAME} without an account. Your notes stay in your browser and never reach us.</li>
          <li>An account is optional. If you create one, we store your notes so they sync across your devices.</li>
          <li>No ads, no analytics trackers, and we never sell your data.</li>
          <li>AI features use your own key, which stays on your device. Requests go straight to the provider you choose.</li>
          <li>You can export your notes or delete your account at any time.</li>
        </ul>
      }
    >
      <p>
        This policy explains what {APP_NAME} (“we”, “us”), at{" "}
        <Link href={ROUTES.home}>www.takemynote.online</Link>, collects, why, and what you can do about it. {APP_NAME} is
        free and open source, so you can also check how it works in the <a href={GITHUB_URL}>source code</a>.
      </p>

      <h2>Using {APP_NAME} without an account</h2>
      <p>
        Your notes, categories and settings are saved in your browser’s local storage, on your device. We don’t receive
        them. If you clear your browser data, they are gone, so keep a backup (Settings → Data management).
      </p>
      <p>
        <strong>The one exception is sharing.</strong> When you turn on a share link for a note, a copy of that one note
        (its title, content, last edit time and whether it’s in the trash) is stored on our servers so that people with
        the link can open it. Your browser keeps a secret key that lets it update or remove the copy. Turning the link off,
        or deleting the note, removes the copy.
      </p>

      <h2>If you create an account</h2>
      <p>To sync your notes, we store:</p>
      <ul>
        <li>
          <strong>Account details:</strong> your name and email address. If you sign in with Google, we receive your name,
          email address and profile picture from Google. If you use email and password, your password is stored only as a
          secure hash.
        </li>
        <li>
          <strong>Your notes and categories</strong>, so they appear on every device you sign in on.
        </li>
        <li>
          <strong>Synced settings:</strong> layout, theme, sorting, text direction, and your chosen AI provider, model and
          writing instructions. <strong>Never your AI key.</strong>
        </li>
        <li>
          <strong>Sign-in sessions:</strong> a session record with the IP address and browser details it was created from,
          used to keep you signed in and to protect your account. Sessions expire after 30 days or when you sign out.
        </li>
        <li>
          <strong>Your profile photo</strong>, if you upload one.
        </li>
      </ul>

      <h2>Share links</h2>
      <p>
        A share link lets anyone who has it read that note, but not edit it. Shared pages are hidden from search engines.
        To count views and prevent abuse we use a short, one-way hash of the visitor’s IP address, never the address
        itself, and these records expire automatically. You can turn a link off at any time and it stops working
        immediately.
      </p>

      <h2>Images</h2>
      <p>
        Images you upload into notes, and profile photos, are stored with our hosting provider at long, random web
        addresses. Before storing them we convert them to a standard format, which removes hidden details such as GPS
        location. Anyone who has an image’s address can view it, so treat images like the note they belong to. Images you
        add from a link are loaded from the website that hosts them.
      </p>

      <h2>AI features</h2>
      <p>
        AI help is optional and uses your own key from OpenAI, Google or Anthropic. The key is encrypted and stored only in
        your browser. When you use AI, your browser sends the selected text and your instructions straight to that
        provider. They don’t pass through our servers, and we never see your key. The provider’s own privacy policy covers
        what they do with that request.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        We only use what the app needs to work: a sign-in cookie while you’re signed in, and your browser’s local storage
        for your notes and preferences. We don’t use analytics, advertising or tracking cookies.
      </p>

      <h2>Who helps us run {APP_NAME}</h2>
      <p>We use a few service providers, only to run the service:</p>
      <ul>
        <li>
          <strong>Vercel</strong>: hosts the website and stores uploaded images.
        </li>
        <li>
          <strong>MongoDB Atlas</strong>: the database for accounts, synced notes and share links.
        </li>
        <li>
          <strong>Google</strong>: only if you choose “Continue with Google”.
        </li>
        <li>
          <strong>OpenAI, Google or Anthropic</strong>: only if you add your own AI key, and only for the requests you
          make.
        </li>
      </ul>
      <p>
        We don’t sell or rent your data, and we don’t share it for advertising. We would only disclose it if the law
        required us to.
      </p>

      <h2>How long we keep data, and deleting it</h2>
      <ul>
        <li>
          <strong>Delete your account</strong> from Settings → Account → Delete account. This removes your notes,
          categories, settings, share links, profile photo, uploaded images and sessions from our servers. The notes on
          your current device stay there until you remove them.
        </li>
        <li>
          When you delete a note, we keep a small record of the deletion (with no content) for up to 30 days, so your
          other devices know to remove it too.
        </li>
        <li>
          Our providers may keep encrypted backups for a limited time before they are overwritten.
        </li>
      </ul>

      <h2>Your choices and rights</h2>
      <p>
        You can see and export all of your notes at any time (Settings → Data management), change them in the app, and
        delete your account yourself. Depending on where you live, you may have further rights, such as asking for a copy
        of your data or objecting to how it’s used. Email us and we’ll help.
      </p>

      <h2>Security</h2>
      <p>
        Connections use HTTPS, sign-in cookies can’t be read by scripts, every request is checked against your account,
        and shared pages are cleaned of anything that could run code. No service can promise perfect security, so please
        use a strong password and report anything suspicious through our{" "}
        <a href={`${GITHUB_URL}/security/advisories/new`}>security page</a>.
      </p>

      <h2>Children</h2>
      <p>
        {APP_NAME} is not meant for children under 13, and we don’t knowingly collect data from them. If you believe a
        child has created an account, contact us and we’ll delete it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change this policy, we’ll update the date at the top. For significant changes, we’ll also let you know on
        the website or in the app.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our{" "}
        <Link href={ROUTES.terms}>Terms of Service</Link>.
      </p>
    </LegalPage>
  );
}
