import React, { useState, useEffect } from 'react';
import { Phone, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface Contact {
  name: string;
  numbers: string[];
  designation?: string;
}

interface Category {
  category: string;
  contacts: Contact[];
}

const EmergencyContacts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [visibleContacts, setVisibleContacts] = useState<number>(10);

  const allContacts: Category[] = [
    {
      category: "POLICE STATE COMMAND EMERGENCY NUMBERS",
      contacts: [
        { name: "ABIA STATE", numbers: ["08079210003", "08079210004", "08079210005"] },
        { name: "ADAMAWA STATE", numbers: ["08089671313"] },
        { name: "AKWA IBOM STATE", numbers: ["08039213071", "08020913810"] },
        { name: "ANAMBRA STATE", numbers: ["07039194332", "08024922772", "08075390511", "08182951257"] },
        { name: "BAUCHI STATE", numbers: ["08151849417", "08127162434", "08084763669", "08073794920"] },
        { name: "BENUE STATE", numbers: ["08066006475", "08053039936", "07075390977"] },
        { name: "BAYELSA STATE", numbers: ["07034578208"] },
        { name: "BORNO STATE", numbers: ["08068075581", "08036071667", "08123823322"] },
        { name: "CROSS RIVERS STATE", numbers: ["08133568456", "07053355415"] },
        { name: "DELTA STATE", numbers: ["08036684974"] },
        { name: "EBONYI STATE", numbers: ["07064515001", "08125273721", "08084704673"] },
        { name: "EDO STATE", numbers: ["08037646272", "08077773721", "08067551618"] },
        { name: "EKITI STATE", numbers: ["08062335577", "07089310359"] },
        { name: "ENUGU STATE", numbers: ["08032003702", "08075390883", "08086671202"] },
        { name: "GOMBE STATE", numbers: ["08150567771", "08151855014"] },
        { name: "IMO STATE", numbers: ["08034773600", "08037037283"] },
        { name: "JIGAWA STATE", numbers: ["08075391069", "07089846285", "08123821598"] },
        { name: "KADUNA STATE", numbers: ["08123822284"] },
        { name: "KANO STATE", numbers: ["08032419754", "08123821575", "064977004", "064977005"] },
        { name: "KATSINA STATE", numbers: ["08075391255", "08075391250"] },
        { name: "KEBBI STATE", numbers: ["08038797644", "08075391307"] },
        { name: "KOGI STATE", numbers: ["08075391335", "07038329084"] },
        { name: "KWARA STATE", numbers: ["07032069501", "08125275046"] },
        { name: "LAGOS STATE", numbers: ["07055462708", "08035963919"] },
        { name: "NASSARAWA STATE", numbers: ["08123821571", "07075391560"] },
        { name: "NIGER STATE", numbers: ["08081777498", "08127185198"] },
        { name: "OGUN STATE", numbers: ["08032136765", "08081770416"] },
        { name: "ONDO STATE", numbers: ["07034313903", "08075391808"] },
        { name: "OSUN STATE", numbers: ["08075872433", "08039537995", "08123823981"] },
        { name: "OYO STATE", numbers: ["08081768614", "08150777888"] },
        { name: "PLATEAU STATE", numbers: ["08126375938", "08075391844", "08038907662"] },
        { name: "RIVERS STATE", numbers: ["08032003514", "08073777717"] },
        { name: "SOKOTO STATE", numbers: ["07068848035", "08075391943"] },
        { name: "TARABA STATE", numbers: ["08140089863", "08073260267"] },
        { name: "YOBE STATE", numbers: ["07039301585", "08035067570"] },
        { name: "ZAMFARA STATE", numbers: ["08106580123"] },
        { name: "ABUJA (F.C.T)", numbers: ["07057337653", "08061581938", "08032003913"] }
      ]
    },
    {
      category: "NIGERIA POLICE FORCE PUBLIC RELATIONS DEPARTMENT",
      contacts: [
        { name: "MUYIWA ADEJOBI", designation: "FPRO – FHQ, ABUJA", numbers: ["08037168147"] },
        { name: "EL-MUSTAPHA SANI", designation: "O/C PUBLIC COMPLAINT BUREAU (PCB)", numbers: ["08065510954"] },
        { name: "FEMI ADEDEJI", designation: "EDITOR – NEWDAWN NEWSPAPER", numbers: ["08033867284"] },
        { name: "KALU CHIJIOKE EREM", designation: "STAFF OFFICER STRATEGIC COMMUNICATION", numbers: ["08028815210"] },
        { name: "ABUBAKAR ZAYYANU AMBURSA", designation: "ZONE 1, KANO", numbers: ["08035669700", "08151600860"] },
        { name: "HAUWA IDRIS-ADAMU", designation: "ZONE 2 LAGOS", numbers: ["08163531403"] },
        { name: "YUSUF ADAMU MOHAMMED", designation: "ZONE 3, YOLA", numbers: ["08032281587"] },
        { name: "KAAVANGER AONDONA DAVID", designation: "ZONE 4 - MAKURDI", numbers: ["07064728798"] },
        { name: "TIJANI MOMOH", designation: "ZONE 5, BENIN", numbers: ["08038059618"] },
        { name: "NELSON ANEJI OKPABI", designation: "ZONE 6, CALABAR", numbers: ["08130485363"] },
        { name: "ISTIFANUS SUNDAY BAKO", designation: "ZONE 7, ABUJA", numbers: ["08032577169", "08032801500"] },
        { name: "RUTH AWI", designation: "ZONE 8, LOKOJA", numbers: ["08064048892"] },
        { name: "IHEANETU BRUNO CHUKWUDERA", designation: "ZONE 9, UMUAHIA", numbers: ["08100844951"] },
        { name: "UTHMAN YAGUB MUHAMMAD", designation: "ZONE 10, SOKOTO", numbers: ["07036662958"] },
        { name: "BENJAMIN AYENI", designation: "ZONE 11, OSOGBO", numbers: ["08039152115"] },
        { name: "THOMAS GONI", designation: "ZONE 12, BAUCHI", numbers: ["08067467122", "08172271958"] },
        { name: "NWODE NKEIRUKA H.", designation: "ZONE 13, AWKA", numbers: ["07065821923"] },
        { name: "SHEHU SULEIMAN", designation: "ZONE 14, KATSINA", numbers: ["08063282662", "08023871144"] },
        { name: "ABUBAKAR MOHAMMED", designation: "ZONE 15, MAIDUGURI", numbers: ["09027777097"] },
        { name: "IKWO KEVIN LAFIEGHE", designation: "ZONE 16, YENAGOA", numbers: ["08038985714"] },
        { name: "ADEOYE AKEEM ADEOLA", designation: "ZONE 17, AKURE", numbers: ["08163247975"] },
        { name: "GEOFFREY OGBONNA", designation: "ABIA STATE", numbers: ["08039148294"] },
        { name: "YAHAYA SULEIMAN", designation: "ADAMAWA STATE", numbers: ["08065604764"] },
        { name: "ODIKO S. OGBECHE-MACDON", designation: "AKWA IBOM STATE", numbers: ["08033380470"] },
        { name: "IKENGANYIA T. ANTHONY", designation: "ANAMBRA STATE", numbers: ["08039334002"] },
        { name: "AHMED MOHAMMED WAKIL", designation: "BAUCHI STATE", numbers: ["08034844393"] },
        { name: "BUTSWAT ASINIM", designation: "BAYELSA STATE", numbers: ["08032789712"] },
        { name: "ANENE SEWUESE CATHERINE", designation: "BENUE STATE", numbers: ["08032845555"] },
        { name: "SANI KAMILU", designation: "BORNO STATE", numbers: ["08066836440"] },
        { name: "IRENE UGBO", designation: "CROSS RIVER STATE", numbers: ["08068559326"] },
        { name: "EDAFE BRIGHT", designation: "DELTA STATE", numbers: ["08131070122"] },
        { name: "CHRIS ANYANWU", designation: "EBONYI STATE", numbers: ["08037739134"] },
        { name: "CHIDI NWABUZOR", designation: "EDO STATE", numbers: ["08033726625"] },
        { name: "ABUTU SUNDAY", designation: "EKITI STATE", numbers: ["09064050086"] },
        { name: "DANIEL NDUKWE EKEA", designation: "ENUGU STATE", numbers: ["08063722988"] },
        { name: "MAHID MUA'ZU ABUBAKAR", designation: "GOMBE STATE", numbers: ["08068508998"] },
        { name: "MICHAEL ABATTAM", designation: "IMO STATE", numbers: ["08037166122"] },
        { name: "LAWAN SHIISU ADAM", designation: "JIGAWA STATE", numbers: ["08109881890"] },
        { name: "MOHAMMED JALIGE", designation: "KADUNA STATE", numbers: ["08039142451"] },
        { name: "HARUNA ABDULAHI", designation: "KANO STATE", numbers: ["08037742748"] },
        { name: "GAMBO ISAH", designation: "KATSINA STATE", numbers: ["08065737489", "08076666207"] },
        { name: "NAFIU ABUBAKAR", designation: "KEBBI STATE", numbers: ["08065159812"] },
        { name: "WILLIAM OVYE AYA", designation: "KOGI STATE", numbers: ["08107899269"] },
        { name: "OKASANNMI AJAYI", designation: "KWARA STATE", numbers: ["08032365122", "08081763132"] },
        { name: "BENJAMIN HUNDEYIN", designation: "LAGOS STATE", numbers: ["07062606717"] },
        { name: "RAMHAN NANSEL", designation: "NASARAWA STATE", numbers: ["08037461715"] },
        { name: "WASIU A. ABIODUN", designation: "NIGER STATE", numbers: ["08032233454"] },
        { name: "ABIMBOLA OYEYEMI", designation: "OGUN STATE", numbers: ["08034241238", "08123822910"] },
        { name: "ADEWALE OSIFESO", designation: "OYO STATE", numbers: ["08068122698"] },
        { name: "ODUNLAMI IBUKUN", designation: "ONDO STATE", numbers: ["08067669945"] },
        { name: "OPALOLA YEMISI O.", designation: "OSUN STATE", numbers: ["08067788119"] },
        { name: "ALFRED ALABO", designation: "PLATEAU STATE", numbers: ["08060545670"] },
        { name: "GRACE WOYENGIKURO IRINGE-KOKO", designation: "RIVERS STATE", numbers: ["08036219523"] },
        { name: "SANUSI ABUBAKAR", designation: "SOKOTO STATE", numbers: ["08037770342"] },
        { name: "ABDULLAHI USMAN", designation: "TARABA STATE", numbers: ["08036562695", "08080025992"] },
        { name: "DUNGUS ABDULKARIM", designation: "YOBE STATE", numbers: ["08065682446"] },
        { name: "MUHAMMED SHEHU", designation: "ZAMFARA STATE", numbers: ["08091914752"] },
        { name: "JOSEPHINE ADEH", designation: "FCT-ABUJA", numbers: ["07038979348"] },
        { name: "ALIYU GIWA", designation: "FHQ ANNEX LAGOS/POLICE COOPERATIVE", numbers: ["08067025331"] },
        { name: "OSAIGBOVO EHISIENMEN", designation: "PRESS SEC TO HON. MIN. OF POLICE AFFAIRS", numbers: ["08060914051"] },
        { name: "EGUAOJE FUNMILAYO", designation: "FCID", numbers: ["08035996794"] },
        { name: "LEKAN FANIYI", designation: "MARITIME", numbers: ["07032341701"] },
        { name: "NAFIU HABIB", designation: "POLICE ACADEMY KANO (POLAC)", numbers: ["08025635508", "08050404039"] },
        { name: "JOB ATABOR", designation: "SPORTS", numbers: ["08065265440"] },
        { name: "ADEOTI OLATADE", designation: "NATIONAL INSTITUTE OF POLICE STUDIES", numbers: ["08032499032"] },
        { name: "EZE CHIDIEBERE K.", designation: "POLICE MEDICAL", numbers: ["08063388336"] },
        { name: "DUWON AMUNEDON", designation: "STAFFCOL JOS", numbers: ["07030239661"] },
        { name: "MUHAMMAD SADIQ", designation: "AIRWING", numbers: ["08065633038"] },
        { name: "EYITAYO JOHNSON", designation: "PSFU", numbers: ["08034337204"] },
        { name: "DARAMOLA KAZEEM", designation: "AIRPORT", numbers: ["08033035204"] },
        { name: "GBOLAHAN MORONFOLU", designation: "EOD-CBRN", numbers: ["08033296724"] },
        { name: "EMETO FRANKLIN MMADUABUCHI", designation: "EASTERN PORT", numbers: ["08114989912"] }
      ]
    },
    {
      category: "OTHER EMERGENCY NUMBERS",
      contacts: [
        { name: "Police Emergency", numbers: ["01-4931260", "01-4978899"] },
        { name: "Rapid Response Squad (RRS)", numbers: ["070-55350249", "070-35068242", "080-79279349"] },
        { name: "Rape Helpline", numbers: ["080072732255"] },
        { name: "Inspector General of Police (IGP)", numbers: ["0805966666"] },
        { name: "Nigerian Army Human Rights", numbers: ["08160134303", "08161507644"] },
        { name: "Depression/Suicide Prevention", numbers: ["08062106493", "08092106493", "09080217555"] },
        { name: "State Security Service (SSS)", numbers: ["08132222105–9"] },
        { name: "Federal Road Safety Corps (FRSC)", numbers: ["122", "07002255372"] },
        { name: "Child Domestic Violence", numbers: ["08107572829", "08131643208"] },
        { name: "Violation of Girls and Women helpline", numbers: ["0800072732255"] },
        { name: "Lagos Emergency Service", numbers: ["767", "112"] },
        { name: "Lagos State Traffic Management Authority", numbers: ["08075005411", "0802311742"] },
        { name: "FRSC Zonal Office (Lagos State)", numbers: ["08033706639", "01-7742771"] },
        { name: "Fire Help Lines (Lagos State)", numbers: ["01-7944929", "080-33235892", "080-33235890"] },
        { name: "Child Abuse hotline (Lagos)", numbers: ["08085753932", "08102678442"] },
        { name: "Domestic Violence (Lagos)", numbers: ["08057542266", "08102678443"] },
        { name: "Health Emergency Initiative (HEI)", numbers: ["08155554459", "08035766767", "08109942450"] }
      ]
    }
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredContacts = allContacts.map(category => ({
    ...category,
    contacts: category.contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.numbers.some(number => number.includes(searchTerm)) ||
      (contact.designation && contact.designation.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.contacts.length > 0);

  const loadMore = () => {
    setVisibleContacts(prev => prev + 10);
  };

  useEffect(() => {
    setVisibleContacts(10);
  }, [searchTerm]);

  return (
    <div className="bg-gradient-to-br from-blue-400 to-cyan-300 min-h-screen p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 text-white">Emergency Contacts</h2>

        <div className="sticky top-0 z-10 bg-white rounded-full shadow-lg mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for contacts or numbers"
              className="w-full px-6 py-3 pl-12 pr-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={24} />
          </div>
        </div>

        <div className="space-y-6">
          {filteredContacts.map((category, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <button
                className="w-full p-4 text-left font-semibold text-lg flex justify-between items-center"
                onClick={() => toggleCategory(category.category)}
              >
                {category.category}
                {expandedCategories.includes(category.category) ? (
                  <ChevronUp size={24} />
                ) : (
                  <ChevronDown size={24} />
                )}
              </button>
              {expandedCategories.includes(category.category) && (
                <ul className="divide-y divide-gray-200">
                  {category.contacts.slice(0, visibleContacts).map((item, idx) => (
                    <li key={idx} className="p-4">
                      <h4 className="font-semibold text-lg mb-1">{item.name}</h4>
                      {item.designation && <p className="text-sm text-gray-600 mb-2">{item.designation}</p>}
                      <div className="flex flex-wrap">
                        {item.numbers.map((number, numIdx) => (
                          <a
                            key={numIdx}
                            href={`tel:${number}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2 hover:bg-blue-200 transition-colors duration-200"
                          >
                            <Phone size={16} className="mr-1" />
                            {number}
                          </a>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {expandedCategories.includes(category.category) && category.contacts.length > visibleContacts && (
                <button
                  className="w-full p-3 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  onClick={loadMore}
                >
                  Load More
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;