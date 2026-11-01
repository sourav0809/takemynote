import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";
import { APP_NAME, CONTACT_EMAIL, GITHUB_URL, ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms for using ${APP_NAME}, a free, private notebook that works in your browser.`,
  alternates: { canonical: ROUTES.terms },
};

export default function TermsPage() {
  return (
    <LegalPage
      command="terms"
      title="Terms of Service"
      lastUpdated="November 1, 2026"
      summary={
        <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-sky-ink/60">
          <li>{APP_NAME} is free. Your notes belong to you.</li>
          <li>Use it lawfully, and don’t share anything harmful or that isn’t yours to share.</li>
          <li>Keep your own backups. The service is provided as it is, without guarantees.</li>
          <li>You can stop using it and delete your account at any time.</li>
        </ul>
      }
    >
      <p>
        These terms apply when you use {APP_NAME} at <Link href={ROUTES.home}>www.takemynote.online</Link> (“the
        service”). By using the service you agree to them. If you don’t agree, please don’t use it. Our{" "}
        <Link href={ROUTES.privacy}>Privacy Policy</Link> explains how we handle your data.
      </p>

      <h2>The service</h2>
      <p>
        {APP_NAME} is a free note-taking app. You can use it without an account, in which case your notes are saved in your
        browser. An optional account adds sync across devices. We may add, change or remove features over time, and may
        pause the service for maintenance.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give accurate details, and keep your password and devices secure.</li>
        <li>You’re responsible for what happens under your account.</li>
        <li>Tell us straight away if you think someone else has accessed it.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You own everything you write and upload. You give us permission to store, copy and display your content only as
        needed to run the service: for example, to sync it to your devices, or to show a note to people you’ve shared a
        link with. We don’t claim any other rights to it.
      </p>

      <h2>Sharing</h2>
      <p>
        When you turn on a share link, anyone who has the link can read that note. You’re responsible for what you share
        and with whom. Don’t share other people’s private information without their permission. You can turn a link off at
        any time.
      </p>

      <h2>Acceptable use</h2>
      <p>Don’t use {APP_NAME} to:</p>
      <ul>
        <li>break the law, or share content that is illegal, including anything that sexually exploits children;</li>
        <li>harass, threaten or defraud others, or share phishing pages, malware or spam;</li>
        <li>share content that infringes someone else’s copyright, trademark or privacy;</li>
        <li>
          attack, overload or disrupt the service, get around its limits, or access other people’s accounts or data.
        </li>
      </ul>
      <p>
        We may remove share links or content that break these rules, suspend accounts that do, and report illegal content
        to the authorities. To report a shared note, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with its
        link.
      </p>

      <h2>AI features</h2>
      <p>
        AI features use your own key from OpenAI, Google or Anthropic. Your use of that provider is covered by your
        agreement with them, including any costs. AI suggestions can be wrong, so check anything important before you rely
        on it.
      </p>

      <h2>Backups</h2>
      <p>
        Notes kept only in your browser can be lost if you clear your browser data or lose your device. Please keep
        backups (Settings → Data management). We work hard to keep synced notes safe, but we can’t guarantee that data
        will never be lost.
      </p>

      <h2>Open source</h2>
      <p>
        {APP_NAME}’s source code is available on <a href={GITHUB_URL}>GitHub</a> under the MIT License. That license covers
        the code. These terms cover the hosted service at www.takemynote.online.
      </p>

      <h2>No warranty</h2>
      <p>
        The service is provided “as is” and “as available”, without warranties of any kind, whether express or implied,
        including that it will be uninterrupted, error-free or fit for a particular purpose.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent the law allows, {APP_NAME} and its maker are not liable for any indirect, incidental, special
        or consequential damages, or for any loss of data, profits or goodwill, arising from your use of the service. The
        service is free, and our total liability for any claim is limited to the amount you paid us for it, which is zero.
        Some places don’t allow these limits, so they may not all apply to you.
      </p>

      <h2>Ending your use</h2>
      <p>
        You can stop using {APP_NAME} at any time, and delete your account from Settings → Account. We may suspend or close
        accounts that break these terms. Where we reasonably can, we’ll give you a chance to export your notes first.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        If we change these terms, we’ll update the date at the top. For significant changes, we’ll also let you know on
        the website or in the app. If you keep using the service after a change, you accept the new terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
