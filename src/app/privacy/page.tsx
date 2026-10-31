import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: `Как ${site.name} обрабатывает данные из заявок на сайте.`,
};

const SECTIONS = [
  {
    title: "Какие данные мы получаем",
    items: [
      "Имя, если вы его указали.",
      "Телефон или ник в Telegram — чтобы ответить на заявку.",
      "Пожелания к поездке: направление, даты, количество туристов, бюджет.",
      "Технические данные: зашифрованный отпечаток IP-адреса для защиты от спама. Сам IP-адрес мы не храним.",
    ],
  },
  {
    title: "Зачем",
    items: [
      "Чтобы подобрать тур или авиабилеты и связаться с вами.",
      "Чтобы защитить форму заявки от спама и ботов.",
    ],
  },
  {
    title: "Кому передаём",
    items: [
      "Только с вашего согласия и только для бронирования — туроператору, авиакомпании или отелю.",
      "Мы не продаём и не передаём ваши данные для рекламы.",
    ],
  },
  {
    title: "Где и сколько храним",
    items: [
      "Заявки хранятся в защищённой облачной базе данных, уведомление о заявке приходит нам в Telegram.",
      "Храним заявку не дольше одного года, если вы не стали нашим туристом.",
    ],
  },
  {
    title: "Ваши права",
    items: [
      "Вы можете попросить показать, исправить или удалить ваши данные — напишите нам в Telegram или WhatsApp.",
      "Вы можете отозвать согласие на обработку данных в любой момент тем же способом.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="wrap max-w-3xl py-10 md:py-14">
      <h1 className="text-[clamp(2rem,1.3rem+2.4vw,3rem)] leading-tight text-pine">Политика конфиденциальности</h1>
      <p className="mt-5 text-lg text-muted">
        Эта страница объясняет, какие данные {site.name} получает через формы на сайте и как с ними обращается. Отправляя
        заявку, вы соглашаетесь на обработку этих данных для подбора и бронирования поездки.
      </p>
      {SECTIONS.map((section) => (
        <section key={section.title} className="mt-10">
          <h2 className="text-2xl text-pine">{section.title}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[17px]">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
      <section className="mt-10">
        <h2 className="text-2xl text-pine">Контакты</h2>
        <p className="mt-4 text-[17px]">
          По вопросам о данных: {site.phone},{" "}
          <a href={site.telegramChat} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            Telegram
          </a>
          . {site.hours}.
        </p>
      </section>
    </div>
  );
}
