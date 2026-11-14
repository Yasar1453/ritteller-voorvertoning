<?php
// Ontvangt het offerteformulier van /offerte en mailt de aanvraag naar info@ritteller.nl.
// Geen database en geen opslag: de aanvraag bestaat alleen als e-mail.
declare(strict_types=1);
const NAAR = 'info@ritteller.nl';

function terug(string $waarom): never {
    header('Location: /offerte?fout=' . rawurlencode($waarom) . '#formulier', true, 303);
    exit;
}
// Eén regel tekst: geen regeleinden (die zouden extra mailkoppen kunnen maken) en een grens aan de lengte.
function regel(string $naam, int $max = 120): string {
    $w = trim((string)($_POST[$naam] ?? ''));
    return mb_substr(preg_replace('/[\r\n\t]+/', ' ', $w), 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { header('Location: /offerte', true, 303); exit; }
// Vangnet tegen robots: een veld dat mensen niet zien, en een formulier dat te snel is ingevuld.
if (regel('website') !== '') { header('Location: /bedankt', true, 303); exit; }
$gestart = (int)($_POST['gestart'] ?? 0);
if ($gestart > 0 && (time() - $gestart) < 4) { header('Location: /bedankt', true, 303); exit; }

$bedrijf = regel('bedrijf'); $naam = regel('naam'); $email = regel('email', 200); $telefoon = regel('telefoon', 40);
$autos = (int)regel('autos', 4); $straat = regel('straat'); $postcode = regel('postcode', 10); $plaats = regel('plaats', 80);
$kvk = regel('kvk', 12);
$opmerking = mb_substr(trim((string)($_POST['opmerking'] ?? '')), 0, 2000);

if ($bedrijf === '' || $naam === '' || $straat === '' || $postcode === '' || $plaats === '') terug('Vul alle verplichte velden in.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) terug('Het e-mailadres klopt niet.');
if ($autos < 1 || $autos > 999) terug('Vul in om hoeveel auto\'s het gaat.');

// Dezelfde staffel als op de prijzenpagina, als richtprijs in de mail.
$perMaand = $autos >= 15 ? 2.99 : ($autos >= 10 ? 3.99 : 4.99);
$euro = fn(float $x): string => '€ ' . number_format($x, 2, ',', '.');

$tekst = "Nieuwe offerteaanvraag via ritteller.nl\n\n"
    . "Bedrijf:      $bedrijf\n" . ($kvk !== '' ? "KvK-nummer:   $kvk\n" : '')
    . "Contact:      $naam\nE-mail:       $email\n" . ($telefoon !== '' ? "Telefoon:     $telefoon\n" : '')
    . "\nAantal auto's: $autos\n"
    . "Richtprijs:   {$euro($perMaand)} per auto per maand = {$euro($autos * $perMaand)} per maand\n"
    . "Trackers:     $autos x {$euro(99.99)} = {$euro($autos * 99.99)} eenmalig\n"
    . "(exclusief btw, volgens de prijzen op de site)\n"
    . "\nBezorgadres:\n$straat\n$postcode $plaats\n"
    . ($opmerking !== '' ? "\nOpmerking:\n$opmerking\n" : '')
    . "\nBeantwoord deze mail om de aanvrager te bereiken.\n";

$koppen = "From: Ritteller website <" . NAAR . ">\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit";
$onderwerp = '=?UTF-8?B?' . base64_encode("Offerteaanvraag: $bedrijf ($autos auto's)") . '?=';
if (!mail(NAAR, $onderwerp, $tekst, $koppen, '-f' . NAAR)) terug('Het versturen is niet gelukt. Mail ons op ' . NAAR . '.');
header('Location: /bedankt', true, 303);
