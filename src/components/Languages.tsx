const LANGS: [string, string, string][] = [
  ['en-US', 'English (US)',       '9'],
  ['en-GB', 'English (UK)',       '7'],
  ['en-IN', 'English (IN)',       '6'],
  ['es-MX', 'Spanish (MX)',       '5'],
  ['es-ES', 'Spanish (ES)',       '4'],
  ['fr-FR', 'French',             '5'],
  ['de-DE', 'German',             '4'],
  ['it-IT', 'Italian',            '3'],
  ['pt-BR', 'Portuguese (BR)',    '4'],
  ['nl-NL', 'Dutch',              '2'],
  ['ja-JP', 'Japanese',           '3'],
  ['ko-KR', 'Korean',             '2'],
  ['zh-CN', 'Mandarin',           '3'],
  ['hi-IN', 'Hindi',              '3'],
  ['ar-SA', 'Arabic',             '2'],
  ['tr-TR', 'Turkish',            '2'],
  ['sv-SE', 'Swedish',            '2'],
  ['pl-PL', 'Polish',             '2'],
  ['ru-RU', 'Russian',            '2'],
  ['he-IL', 'Hebrew',             '1'],
  ['vi-VN', 'Vietnamese',         '2'],
  ['id-ID', 'Indonesian',         '2'],
  ['th-TH', 'Thai',               '2'],
  ['ms-MY', 'Malay',              '1'],
  ['da-DK', 'Danish',             '2'],
  ['fi-FI', 'Finnish',            '1'],
  ['no-NO', 'Norwegian',          '1'],
  ['cs-CZ', 'Czech',              '1'],
  ['hu-HU', 'Hungarian',          '1'],
  ['el-GR', 'Greek',              '1'],
  ['ro-RO', 'Romanian',           '1'],
];

export default function Languages() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head reveal">
          <span className="kicker">Languages</span>
          <h2 className="section-title">
            Thirty-one languages, <em>one cadence.</em>
          </h2>
          <p className="section-sub">
            Native-quality voice with regional accent control. Switch mid-call without
            re-prompting. Numbers in parentheses are the count of base voices native to
            that language.
          </p>
        </div>
        <div className="lang-list reveal">
          {LANGS.map(([code, name, cnt]) => (
            <div key={code} className="li">
              <span className="flag">{code}</span>
              <span className="name">{name}</span>
              <span className="cnt">{cnt} voices</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
