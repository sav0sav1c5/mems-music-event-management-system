import { DollarSign, Calendar, Megaphone, MessageCircle } from 'lucide-react';

export default function MemsLogo() {
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-12">
        {/* Gornji red */}
        <div className="flex items-center gap-24">
          {/* Ticket Sales (tekst levo, ikona desno) */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-white font-bold text-2xl">TICKET</div>
              <div className="text-white font-bold text-2xl">SALES</div>
            </div>
            <div className="bg-lime-400 rounded-2xl p-5 flex items-center justify-center w-20 h-20">
              <DollarSign className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Event Organization (ikona levo, tekst desno) */}
          <div className="flex items-center gap-4">
            <div className="bg-pink-500 rounded-2xl p-5 flex items-center justify-center w-20 h-20">
              <Calendar className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-2xl">EVENT</div>
              <div className="text-white font-bold text-2xl">ORGANIZATION</div>
            </div>
          </div>
        </div>

        {/* MEMS centar */}
        <div className="text-white font-bold text-8xl tracking-wider mb-6 text-center">
          MEMS
        </div>

        {/* Donji red */}
        <div className="flex items-center gap-24">
          {/* Media Campaign (tekst levo, ikona desno) */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-white font-bold text-2xl">MEDIA</div>
              <div className="text-white font-bold text-2xl">CAMPAIGN</div>
            </div>
            <div className="bg-purple-500 rounded-2xl p-5 flex items-center justify-center w-20 h-20">
              <Megaphone className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Performer Communication (ikona levo, tekst desno) */}
          <div className="flex items-center gap-4">
            <div className="bg-sky-400 rounded-2xl p-5 flex items-center justify-center w-20 h-20">
              <MessageCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-2xl">PERFORMER</div>
              <div className="text-white font-bold text-2xl">COMMUNICATION</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
