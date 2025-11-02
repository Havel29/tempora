export type GlobalEvent = {
  year: number;
  title: string;
  description: string;
};

// Historical events by MM-DD (at least 2 per day)
const globalEvents: Record<string, GlobalEvent[]> = {
  '01-01': [
    { year: 1959, title: 'Rivoluzione Cubana', description: 'Fidel Castro prende il potere a Cuba, rovesciando il dittatore Batista' },
    { year: 2002, title: 'Euro in circolazione', description: "L'euro diventa la valuta ufficiale in 12 paesi europei, sostituendo le monete nazionali" },
    { year: 1863, title: 'Proclamazione di emancipazione', description: 'Abraham Lincoln firma il documento che dichiara liberi gli schiavi negli stati confederati' },
  ],
  '01-02': [
    { year: 1492, title: 'Fine della Reconquista', description: 'I Re Cattolici conquistano Granada, ultimo regno musulmano in Spagna' },
    { year: 1839, title: 'Prima foto di persona', description: 'Louis Daguerre realizza la prima fotografia con una persona riconoscibile' },
  ],
  '01-27': [
    { year: 1945, title: 'Liberazione di Auschwitz', description: "Le truppe sovietiche liberano il campo di concentramento di Auschwitz-Birkenau" },
    { year: 1967, title: 'Disastro Apollo 1', description: "Incendio durante un test sulla rampa di lancio, muoiono gli astronauti Grissom, White e Chaffee" },
  ],
  '02-14': [
    { year: 1876, title: 'Brevetto del telefono', description: 'Alexander Graham Bell deposita il brevetto del telefono, battendo Gray di poche ore' },
    { year: 1929, title: 'Massacro di San Valentino', description: 'Sette membri della banda rivale di Al Capone vengono uccisi a Chicago' },
  ],
  '03-15': [
    { year: -44, title: 'Assassinio di Cesare', description: 'Giulio Cesare viene pugnalato a morte in Senato da un gruppo di congiurati' },
    { year: 1917, title: 'Abdicazione dello Zar', description: "Lo Zar Nicola II abdica, ponendo fine alla dinastia Romanov" },
  ],
  '04-15': [
    { year: 1912, title: 'Affondamento del Titanic', description: 'Il transatlantico RMS Titanic affonda dopo aver colpito un iceberg, muoiono oltre 1500 persone' },
    { year: 1865, title: 'Morte di Lincoln', description: 'Il presidente Abraham Lincoln muore dopo essere stato colpito al Teatro Ford' },
  ],
  '05-08': [
    { year: 1945, title: 'Fine della guerra in Europa', description: 'La Germania nazista firma la resa incondizionata, terminando la Seconda Guerra Mondiale in Europa' },
    { year: 1886, title: 'Coca-Cola inventata', description: 'Il farmacista John Pemberton vende la prima Coca-Cola ad Atlanta, Georgia' },
  ],
  '06-06': [
    { year: 1944, title: 'D-Day', description: 'Gli Alleati sbarcano in Normandia, dando inizio alla liberazione dell\'Europa occidentale' },
    { year: 1984, title: 'Operazione Blue Star', description: 'L\'esercito indiano attacca il Tempio d\'Oro di Amritsar' },
  ],
  '07-04': [
    { year: 1776, title: 'Indipendenza USA', description: 'Il Congresso americano approva la Dichiarazione di Indipendenza dalla Gran Bretagna' },
    { year: 2012, title: 'Bosone di Higgs', description: 'Il CERN annuncia la scoperta del bosone di Higgs, la "particella di Dio"' },
  ],
  '07-20': [
    { year: 1969, title: 'Sbarco sulla Luna', description: 'Neil Armstrong e Buzz Aldrin diventano i primi esseri umani a camminare sulla Luna' },
    { year: 1944, title: 'Attentato a Hitler', description: 'Fallisce il tentativo di assassinio di Adolf Hitler con una bomba nel suo quartier generale' },
  ],
  '08-06': [
    { year: 1945, title: 'Bomba atomica su Hiroshima', description: 'Gli USA sganciano la prima bomba atomica su Hiroshima, uccidendo oltre 70.000 persone istantaneamente' },
    { year: 1991, title: 'Nasce il World Wide Web', description: 'Tim Berners-Lee pubblica il primo sito web, dando inizio all\'era di Internet pubblica' },
  ],
  '09-11': [
    { year: 2001, title: 'Attentati dell\'11 settembre', description: 'Attacchi terroristici alle Torri Gemelle e al Pentagono, quasi 3000 vittime' },
    { year: 1973, title: 'Colpo di stato in Cile', description: 'Augusto Pinochet rovescia il governo democraticamente eletto di Salvador Allende' },
  ],
  '10-12': [
    { year: 1492, title: 'Scoperta dell\'America', description: 'Cristoforo Colombo sbarca nelle Bahamas, credendo di aver raggiunto le Indie' },
    { year: 1968, title: 'Olimpiadi di Città del Messico', description: 'Tommie Smith e John Carlos fanno il saluto del Black Power sul podio olimpico' },
  ],
  '11-02': [
    { year: 1947, title: 'Volo del gigante', description: 'Il primo volo del Hughes H-4 Hercules, il più grande idrovolante mai costruito con apertura alare di 97 metri' },
    { year: 1917, title: 'Dichiarazione Balfour', description: 'Il Regno Unito sostiene la creazione di una "patria nazionale per il popolo ebraico" in Palestina' },
    { year: 1936, title: 'Prima trasmissione TV BBC', description: 'La BBC inizia il primo servizio televisivo pubblico regolare al mondo' },
  ],
  '11-09': [
    { year: 1989, title: 'Caduta del Muro di Berlino', description: 'Il muro che divideva Berlino Est e Ovest viene abbattuto, simbolo della fine della Guerra Fredda' },
    { year: 1938, title: 'Notte dei cristalli', description: 'Pogrom contro gli ebrei in Germania e Austria, migliaia di negozi e sinagoghe distrutti' },
  ],
  '12-07': [
    { year: 1941, title: 'Attacco a Pearl Harbor', description: 'Il Giappone attacca la base navale USA di Pearl Harbor, causando l\'entrata degli Stati Uniti nella Seconda Guerra Mondiale' },
    { year: 1972, title: 'Foto della Terra', description: 'L\'equipaggio dell\'Apollo 17 scatta "The Blue Marble", una delle foto più iconiche della Terra' },
  ],
  '12-25': [
    { year: 1991, title: 'Dissoluzione dell\'URSS', description: 'Mikhail Gorbachev si dimette, l\'Unione Sovietica cessa ufficialmente di esistere' },
    { year: 800, title: 'Incoronazione di Carlo Magno', description: 'Papa Leone III incorona Carlo Magno imperatore del Sacro Romano Impero a Roma' },
    { year: 1989, title: 'Fucilazione Ceaușescu', description: 'Il dittatore rumeno Nicolae Ceaușescu e sua moglie vengono giustiziati dopo un processo sommario' },
  ],
};

export function getGlobalEventsFor(date: string): GlobalEvent[] {
  // Extract MM-DD from YYYY-MM-DD
  const mmdd = date.substring(5);
  return globalEvents[mmdd] || [];
}
