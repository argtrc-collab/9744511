import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { LeftSidebar, CellItemSummary } from './components/LeftSidebar';
import { DrawerMenu } from './components/DrawerMenu';
import { ChangePvzModal } from './components/ChangePvzModal';
import { ScannerSettingsModal } from './components/ScannerSettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AcceptanceView, AcceptanceItem } from './components/AcceptanceView';
import { AcceptAgainView } from './components/AcceptAgainView';
import { IssuanceView } from './components/IssuanceView';
import { ReturnsView } from './components/ReturnsView';
import { CellManagerView } from './components/CellManagerView';
import { CourierDispatchView } from './components/CourierDispatchView';
import { DefectManagementView } from './components/DefectManagementView';
import { PvzVideoMonitoringView } from './components/PvzVideoMonitoringView';
import { PvzAnalyticsView } from './components/PvzAnalyticsView';
import { RegulationsFineView } from './components/RegulationsFineView';
import { TutorialViewer } from './components/TutorialViewer';
import { CuratorSupportView } from './components/CuratorSupportView';
import { CreateOrderView } from './components/CreateOrderView';
import { SubModuleType } from './components/MoreHubView';
import { PvzSupplyModal } from './components/PvzSupplyModal';
import { MoreHubView } from './components/MoreHubView';
import { GenerationModal } from './components/GenerationModal';
import { ClientQrCodeModal } from './components/ClientQrCodeModal';
import { CameraScannerModal } from './components/CameraScannerModal';
import { ManualInputModal } from './components/ManualInputModal';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import {
  CustomerOrder,
  ScannerSettings,
  RegisteredSticker,
  RepackedItem,
  DefectItem,
  SurplusItem,
  AutoMenuItem,
  BoxItem,
} from './types';
import {
  INITIAL_BOX_CONTENTS,
  INITIAL_REGISTERED_STICKERS,
  INITIAL_REPACKED_ITEMS,
  INITIAL_DEFECTS,
  INITIAL_SURPLUSES,
  INITIAL_AUTOMENUS,
} from './utils/mockData';
import { soundManager } from './utils/audio';

const INITIAL_ACCEPTANCE_ITEMS: AcceptanceItem[] = [
  {
    id: 'acc-item-pvz-bag',
    isPvzSupply: true,
    itemCode: '456576798 5879',
    title: 'Пакет Wildberries (Расходники ПВЗ)',
    color: 'Фирменный фиолетовый',
    size: 'XL',
    barcode: '5898596895',
    kit: 'Пакет Wildberries',
    type: 'bag',
    cellNumber: 'ПВЗ',
  },
  {
    id: 'acc-item-nike',
    cellNumber: '102',
    clientItemsOnCell: 2,
    itemCode: '203891048 2914',
    title: 'Nike / Кроссовки Air Monarch IV мужские (р. 43)',
    color: 'Белый / Черный',
    size: '43',
    barcode: '2038910482914',
    kit: 'Кроссовки 1 пара',
    type: 'sneakers',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'acc-item-wb-hoodie',
    cellNumber: '102',
    clientItemsOnCell: 2,
    itemCode: '203891048 2921',
    title: 'WB Basic / Худи оверсайз с начесом "WB Brand" черное (L)',
    color: 'Черный',
    size: 'L',
    barcode: '2038910482921',
    kit: 'Худи с начесом',
    type: 'hoodie',
    imageUrl: '/item_man_hoodie.png',
  },
  {
    id: 'acc-item-lavazza',
    cellNumber: '390',
    clientItemsOnCell: 2,
    itemCode: '460718294 0125',
    title: 'Lavazza / Кофе в зернах Qualita Oro 1000 г',
    color: 'Золотистый',
    size: '1000 г',
    barcode: '4607182940125',
    kit: 'Пакет с клапаном',
    type: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'acc-item-iphone-case',
    cellNumber: '390',
    clientItemsOnCell: 2,
    itemCode: '460192837 4651',
    title: 'Baseus / Чехол для iPhone 15 силиконовый матовый фиолетовый',
    color: 'Фиолетовый',
    size: 'iPhone 15',
    barcode: '4601928374651',
    kit: 'Чехол в блистере',
    type: 'case',
    imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'acc-item-xiaomi-phone',
    cellNumber: 'Сейф-01',
    clientItemsOnCell: 1,
    itemCode: '693417779 8124',
    title: 'Xiaomi / Смартфон Redmi Note 13 Pro 8/256GB Midnight Black',
    color: 'Midnight Black',
    size: '8/256GB',
    barcode: '6934177798124',
    kit: 'Смартфон, ЗУ 67W, кабель',
    hasDefectRibbon: false,
    type: 'phone',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'acc-item-roborock',
    cellNumber: 'КГТ-01',
    clientItemsOnCell: 1,
    itemCode: '468001829 4719',
    title: 'Roborock / Робот-пылесос Q7 Max с функцией влажной уборки',
    color: 'Белый',
    size: 'КГТ',
    barcode: '4680018294719',
    kit: 'Робот-пылесос, док-станция',
    type: 'vacuum',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'acc-item-longsleeve',
    cellNumber: '521',
    clientItemsOnCell: 1,
    itemCode: '485748578 4758',
    title: 'ТЕЛОДВИЖЕНИЯ / Лонгслив женский базовый оверсайз хлопок',
    color: 'Бежевый',
    size: 'M',
    barcode: '4857485784758',
    kit: 'Лонгслив',
    hasDefectRibbon: true,
    type: 'knitwear',
    imageUrl: '/item_test.png',
  },
];

const INITIAL_CUSTOMER_ORDERS: CustomerOrder[] = [
  // 1. Заказ Алексея Смирнова (Код: 849-102, Ячейка: 102)
  {
    id: 'ord-wb-849102-alexey',
    cellNumber: '102',
    clientPhone: '+7 (916) 420-11-22',
    packagesCount: 2,
    paymentType: 'online',
    isPaid: true,
    isAgeVerified: false,
    createdAt: '14:20',
    pickupCode: '849102',
    qrCode: 'WB-QR-849102',
    isAtDesk: false,
    items: [
      {
        id: 'item-101-nike',
        code: '2038910482914',
        article: '203891048 2914',
        name: 'Nike / Кроссовки Air Monarch IV мужские (р. 43)',
        brand: 'Nike',
        price: 4890,
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'item-102-hoodie',
        code: '2038910482921',
        article: '203891048 2921',
        name: 'WB Basic / Худи оверсайз с начесом "WB Brand" черное (L)',
        brand: 'WB Basic',
        price: 2150,
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: '/item_man_hoodie.png',
      },
    ],
  },

  // 2. Заказ Марии Ковалевой (Код: 512-390, Ячейка: 390, Оплата при получении!)
  {
    id: 'ord-wb-512390-maria',
    cellNumber: '390',
    clientPhone: '+7 (926) 880-34-56',
    packagesCount: 2,
    paymentType: 'on_delivery',
    isPaid: false,
    isAgeVerified: false,
    createdAt: '14:35',
    pickupCode: '512390',
    qrCode: 'WB-QR-512390',
    isAtDesk: false,
    items: [
      {
        id: 'item-103-lavazza',
        code: '4607182940125',
        article: '460718294 0125',
        name: 'Lavazza / Кофе в зернах Qualita Oro 1000 г (Оплата при выдаче)',
        brand: 'Lavazza',
        price: 1390,
        status: 'new',
        isAdult: false,
        icon: '',
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'item-104-baseus',
        code: '4601928374651',
        article: '460192837 4651',
        name: 'Baseus / Чехол для iPhone 15 силиконовый матовый фиолетовый',
        brand: 'Baseus',
        price: 490,
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&auto=format&fit=crop&q=80',
      },
    ],
  },

  // 3. Заказ Игоря Павлова (Код: 194-885, Ячейка: Сейф-01, Дорогостоящая электроника + КИЗ)
  {
    id: 'ord-wb-194885-igor',
    cellNumber: 'Сейф-01',
    clientPhone: '+7 (903) 777-12-88',
    packagesCount: 2,
    paymentType: 'online',
    isPaid: true,
    isAgeVerified: false,
    isPriority: true,
    createdAt: '14:40',
    pickupCode: '194885',
    qrCode: 'WB-QR-194885',
    isAtDesk: false,
    items: [
      {
        id: 'item-201-redmi',
        code: '6934177798124',
        article: '693417779 8124',
        name: 'Xiaomi / Смартфон Redmi Note 13 Pro 8/256GB Midnight Black',
        brand: 'Xiaomi',
        price: 24990,
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'item-202-airpods',
        code: '1959491238472',
        article: '195949123 8472',
        name: 'Apple / Беспроводные наушники AirPods Pro 2 MagSafe (USB-C)',
        brand: 'Apple',
        price: 19890,
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=80',
      },
    ],
  },

  // 4. Заказ Екатерины Романовой (Код: 601-224, Ячейка: КГТ-01, Крупногабаритная техника)
  {
    id: 'ord-wb-601224-ekaterina',
    cellNumber: 'КГТ-01',
    clientPhone: '+7 (985) 332-99-10',
    packagesCount: 2,
    paymentType: 'online',
    isPaid: true,
    isAgeVerified: false,
    createdAt: '14:45',
    pickupCode: '601224',
    qrCode: 'WB-QR-601224',
    isAtDesk: false,
    items: [
      {
        id: 'item-301-roborock',
        code: '4680018294719',
        article: '468001829 4719',
        name: 'Roborock / Робот-пылесос Q7 Max с функцией влажной уборки',
        brand: 'Roborock',
        price: 27900,
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'item-302-humidifier',
        code: '4680018294726',
        article: '468001829 4726',
        name: 'Xiaomi / Увлажнитель воздуха Smart Humidifier 2',
        brand: 'Xiaomi',
        price: 3690,
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop&q=80',
      },
    ],
  },

  // 5. Заказ Ольги Николаевой (Код: 333-777, Ячейка: 118, Примерка + частичная оплата)
  {
    id: 'ord-wb-333777-olga',
    cellNumber: '118',
    clientPhone: '+7 (915) 111-22-33',
    packagesCount: 3,
    paymentType: 'on_delivery',
    isPaid: false,
    isAgeVerified: false,
    createdAt: '15:10',
    pickupCode: '333777',
    qrCode: 'WB-QR-333777',
    isAtDesk: false,
    items: [
      {
        id: 'item-pre-1-dress',
        code: '4620019283741',
        article: '462001928 3741',
        name: 'Zarina / Платье вечернее миди с разрезом шелковое бордовое (44)',
        brand: 'Zarina',
        price: 3490,
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'item-pre-2-shoes',
        code: '4620019283742',
        article: '462001928 3742',
        name: 'Econika / Туфли-лодочки классические бежевые замшевые (38)',
        brand: 'Econika',
        price: 5990,
        status: 'new',
        isAdult: false,
        icon: '',
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'item-pre-3-jewelry',
        code: '4620019283743',
        article: '462001928 3743',
        name: 'Sokolov / Серьги серебряные 925 проба с фианитами',
        brand: 'Sokolov',
        price: 1890,
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=80',
      },
    ],
  },

  // 6. Заказ WB Клуб (Код: 7589, Ячейка: 521, Приоритетный клиент)
  {
    id: 'ord-wb-7589-priority',
    cellNumber: '521',
    clientPhone: '+7 (•••) ••• 75 89',
    packagesCount: 3,
    paymentType: 'online',
    isPaid: true,
    isAgeVerified: false,
    isWbClub: true,
    isPriority: true,
    createdAt: '14:05',
    pickupCode: '7589',
    qrCode: 'WB-QR-7589',
    isAtDesk: false,
    items: [
      {
        id: 'p-521-1',
        code: '48758785940',
        article: '1646827 6789',
        brand: 'GENESIS',
        name: 'Спортивный костюм оверсайз утепленный с начесом',
        price: 1935,
        oldPrice: 5670,
        color: 'черный',
        size: 'M',
        composition: 'Худи с капюшоном, брюки спортивные',
        barcode: '48758785940',
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: '/item_man_hoodie.png',
      },
      {
        id: 'p-521-2',
        code: '48758785941',
        article: '4667827 7911',
        brand: 'Zeyd',
        name: 'Худи оверсайз с начесом базовое теплое',
        price: 1935,
        oldPrice: 5670,
        color: 'голубой',
        size: 'M',
        composition: 'Худи с капюшоном, брюки спортивные',
        barcode: '48758785941',
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: '/item_woman_hoodie.png',
      },
      {
        id: 'p-521-3',
        code: '4857485784758',
        article: '1647827 4569',
        brand: 'ТЕЛОДВИЖЕНИЯ',
        name: 'Лонгслив женский спортивный кофта базовая футболка хлопок',
        price: 1935,
        oldPrice: 5670,
        color: 'бежевый',
        size: 'M',
        composition: 'Худи с капюшоном, брюки спортивные',
        barcode: '4857485784758',
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: '/item_test.png',
      },
      {
        id: 'p-521-4',
        code: '48758785943',
        article: '1648827 1122',
        brand: 'GENESIS',
        name: 'Футболка оверсайз базовая хлопок',
        price: 1342,
        oldPrice: 3200,
        color: 'белый',
        size: 'M',
        composition: 'Футболка 1 шт',
        barcode: '48758785943',
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: '/item_test.png',
      },
      {
        id: 'p-521-5',
        code: '48758785944',
        article: '1649827 3344',
        brand: 'Zeyd',
        name: 'Брюки палаццо широкие трикотажные',
        price: 1845,
        oldPrice: 4500,
        color: 'графит',
        size: 'M',
        composition: 'Брюки 1 шт',
        barcode: '48758785944',
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: '/item_woman_hoodie.png',
      },
      {
        id: 'p-521-6',
        code: '48758785945',
        article: '1650827 5566',
        brand: 'Befree',
        name: 'Свитер вязаный оверсайз теплый',
        price: 1620,
        oldPrice: 3990,
        color: 'молочный',
        size: 'M',
        composition: 'Свитер 1 шт',
        barcode: '48758785945',
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: '/item_test.png',
      },
      {
        id: 'p-521-7',
        code: '48758785946',
        article: '1651827 7788',
        brand: 'Zarina',
        name: 'Платье миди повседневное офисное',
        price: 1590,
        oldPrice: 3790,
        color: 'черный',
        size: 'M',
        composition: 'Платье 1 шт',
        barcode: '48758785946',
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: '/item_woman_hoodie.png',
      },
      {
        id: 'p-521-8',
        code: '48758785947',
        article: '1652827 9900',
        brand: 'Love Republic',
        name: 'Юбка трапеция экокожа',
        price: 1450,
        oldPrice: 3500,
        color: 'шоколад',
        size: 'M',
        composition: 'Юбка 1 шт',
        barcode: '48758785947',
        status: 'paid',
        isAdult: false,
        icon: '',
        imageUrl: '/item_woman_hoodie.png',
      },
    ],
  },
];

export default function App() {
  // Navigation State matching wb_point_emulator.html
  const [activeTab, setActiveTab] = useState<'handover' | 'acceptance' | 'return' | 'more'>('handover');
  const [acceptanceSubTab, setAcceptanceSubTab] = useState<'items' | 'change_cell' | 'reaccept' | 'courier' | 'dbs'>('items');
  const [returnSubTab, setReturnSubTab] = useState<'items' | 'boxes' | 'wb_mp' | 'cardboard' | 'waste'>('items');
  const [selectedCell, setSelectedCell] = useState<string>('');

  // Modals state matching wb_point_emulator.html
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isChangePvzOpen, setIsChangePvzOpen] = useState<boolean>(false);
  const [isScannerSettingsOpen, setIsScannerSettingsOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [pvzName, setPvzName] = useState<string>('г Москва, Центральный проезд Хорошёвского Серебряного Бора, 2');
  const [pvzId, setPvzId] = useState<string>('85789897');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  // Acceptance Items (matching Image 1 & 2)
  const [acceptanceItems, setAcceptanceItems] = useState<AcceptanceItem[]>(() => {
    try {
      const saved = localStorage.getItem('wb_acceptance_items');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ACCEPTANCE_ITEMS;
  });

  // Customer Orders State for Issuance (user managed, policy: 1 cell = 1 order)
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem('wb_customer_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((o: CustomerOrder) => {
            const hasActive = o.items?.some((i) => i.status !== 'rejected' && i.status !== 'issued');
            if (o.status === 'issued' || o.isIssued || !hasActive) {
              return { ...o, isAtDesk: false };
            }
            return o;
          });
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CUSTOMER_ORDERS;
  });
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Scanner Settings
  const [scannerSettings, setScannerSettings] = useState<ScannerSettings>(() => {
    try {
      const saved = localStorage.getItem('wb_scanner_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      prefix: '',
      suffix: '',
      terminator: 'enter',
      soundEnabled: true,
      soundVolume: 85,
      maxKeystrokeIntervalMs: 65,
      minBarcodeLength: 4,
    };
  });

  // Hub Module States for "Еще"
  const [boxContents, setBoxContents] = useState<Record<string, BoxItem[]>>(() => {
    try {
      const saved = localStorage.getItem('wb_box_contents');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_BOX_CONTENTS;
  });

  const [registeredStickers, setRegisteredStickers] = useState<RegisteredSticker[]>(() => {
    try {
      const saved = localStorage.getItem('wb_registered_stickers');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_REGISTERED_STICKERS;
  });

  const [repackedItems, setRepackedItems] = useState<RepackedItem[]>(() => {
    try {
      const saved = localStorage.getItem('wb_repacked_items');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_REPACKED_ITEMS;
  });

  const [defects, setDefects] = useState<DefectItem[]>(() => {
    try {
      const saved = localStorage.getItem('wb_defects');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DEFECTS;
  });

  const [surpluses, setSurpluses] = useState<SurplusItem[]>(() => {
    try {
      const saved = localStorage.getItem('wb_surpluses');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SURPLUSES;
  });

  const [automenus, setAutomenus] = useState<AutoMenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('wb_automenus');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_AUTOMENUS;
  });

  // Modal: 'Это товар для вашего ПВЗ' (Image 1 popup)
  const [supplyModalProps, setSupplyModalProps] = useState<{
    isOpen: boolean;
    code: string;
    title: string;
  }>({
    isOpen: false,
    code: '456576798 5879',
    title: 'Пакет 22х32/40 мкм',
  });

  // Camera Scanner Modal
  const [cameraScannerProps, setCameraScannerProps] = useState<{
    isOpen: boolean;
    title: string;
    hint: string;
    manualLabel: string;
    onResult: (code: string) => void;
  }>({
    isOpen: false,
    title: 'Сканирование',
    hint: 'Наведите камеру на QR-код или штрихкод',
    manualLabel: 'Или введите вручную:',
    onResult: () => {},
  });

  // Emergency Manual Barcode Input Modal (F2)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Generation Modal (Поставки и заказы)
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);

  // QR Code Generator Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Create Order by WB link Modal
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);

  // More hub subModule selector
  const [moreSubModule, setMoreSubModule] = useState<SubModuleType>('hub');

  const handleGenerateShipment = (newItems: AcceptanceItem[]) => {
    setAcceptanceItems((prev) => [...newItems, ...prev]);
    setActiveTab('acceptance');
    setAcceptanceSubTab('items');
  };

  const handleGenerateOrders = (newOrders: CustomerOrder[]) => {
    setCustomerOrders((prev) => [...newOrders, ...prev]);
    if (newOrders.length > 0) {
      setActiveOrderId(newOrders[0].id);
      setSelectedCell(newOrders[0].cellNumber);
    }
    setActiveTab('handover');
  };

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('wb_acceptance_items', JSON.stringify(acceptanceItems));
    localStorage.setItem('wb_customer_orders', JSON.stringify(customerOrders));
    localStorage.setItem('wb_scanner_settings', JSON.stringify(scannerSettings));
    localStorage.setItem('wb_box_contents', JSON.stringify(boxContents));
    localStorage.setItem('wb_registered_stickers', JSON.stringify(registeredStickers));
    localStorage.setItem('wb_repacked_items', JSON.stringify(repackedItems));
    localStorage.setItem('wb_defects', JSON.stringify(defects));
    localStorage.setItem('wb_surpluses', JSON.stringify(surpluses));
    localStorage.setItem('wb_automenus', JSON.stringify(automenus));
    soundManager.setVolume(scannerSettings.soundVolume);
  }, [
    acceptanceItems,
    customerOrders,
    scannerSettings,
    boxContents,
    registeredStickers,
    repackedItems,
    defects,
    surpluses,
    automenus,
  ]);

  // F2 key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsManualModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hardware Scanner Global Handler
  const handleHardwareScan = useCallback(
    (barcode: string) => {
      const clean = barcode.trim();
      if (!clean) return;

      setLastScannedCode(clean);

      // 1. If bag/supply code
      if (clean === '5898596895' || clean.toLowerCase().includes('пакет') || clean.includes('5879')) {
        soundManager.play('good-for-pickpoint');
        setSupplyModalProps({
          isOpen: true,
          code: '456576798 5879',
          title: 'Пакет 22х32/40 мкм',
        });
        return;
      }

      // 2. Check if scanned code is a box barcode (e.g. WB-BOX-48192, WB-BOX-55018, WB-BOX-77301)
      const isKnownBox =
        Boolean(boxContents[clean]) ||
        clean.toUpperCase().startsWith('WB-BOX-') ||
        ['WB-BOX-48192', 'WB-BOX-55018', 'WB-BOX-77301', '984210', '549102'].includes(clean);
      if (isKnownBox) {
        soundManager.announceBoxAccepted();
        setActiveTab('acceptance');
        setAcceptanceSubTab('items');
        return;
      }

      // 3. Check if scanned code matches a customer phone, pickup code, or QR code
      const cleanDigits = clean.replace(/\D/g, '');
      const matchedOrderByClient = customerOrders.find((ord) => {
        const phoneDigits = ord.clientPhone.replace(/\D/g, '');
        const qrMatch = ord.qrCode && ord.qrCode.toLowerCase() === clean.toLowerCase();
        const pickupMatch = ord.pickupCode && (ord.pickupCode === clean || ord.pickupCode === cleanDigits);
        const phoneMatch = cleanDigits.length >= 4 && (phoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(phoneDigits));
        const directPhone = ord.clientPhone.toLowerCase().includes(clean.toLowerCase());
        const cellMatch = clean.toLowerCase() === `ячейка ${ord.cellNumber}`.toLowerCase() || clean === ord.cellNumber;
        return qrMatch || pickupMatch || phoneMatch || directPhone || cellMatch;
      });

      if (matchedOrderByClient) {
        setCustomerOrders((prev) =>
          prev.map((o) => (o.id === matchedOrderByClient.id ? { ...o, isAtDesk: true } : o))
        );
        setActiveTab('handover');
        setSelectedCell(matchedOrderByClient.cellNumber);
        setActiveOrderId(matchedOrderByClient.id);
        soundManager.playOrderOpenSequence({
          cellNumber: matchedOrderByClient.cellNumber,
          goodsCount: matchedOrderByClient.items.length,
          isPaid: matchedOrderByClient.paymentType === 'online' || matchedOrderByClient.isPaid === true,
          hasTryOnAfterPayment: matchedOrderByClient.hasTryOnAfterPayment || matchedOrderByClient.items.some((i) => i.tryOnAfterPayment),
          isWbClub: matchedOrderByClient.isWbClub,
          isPriority: matchedOrderByClient.isPriority,
        });
        return;
      }

      // 4. If in handover with an active order, check if barcode is a product in this order
      if (activeTab === 'handover' && customerOrders.length > 0 && activeOrderId) {
        const activeOrder = customerOrders.find((o) => o.id === activeOrderId);
        if (activeOrder) {
          const matched = activeOrder.items.find(
            (p) => p.code.toLowerCase() === clean.toLowerCase()
          );
          if (matched) {
            const nextStatus = matched.status === 'rejected' ? 'paid' : 'rejected';
            setCustomerOrders((prev) =>
              prev.map((ord) =>
                ord.id === activeOrder.id
                  ? {
                      ...ord,
                      items: ord.items.map((it) =>
                        it.id === matched.id ? { ...it, status: nextStatus } : it
                      ),
                    }
                  : ord
              )
            );
            if (nextStatus === 'rejected') {
              soundManager.play('refusal');
            } else {
              soundManager.play('scan');
            }
            return;
          }
        }
      }

      // 5. Check if barcode belongs to ANY customer order (switch to it directly)
      const orderContainingItem = customerOrders.find((ord) =>
        ord.items.some((it) => it.code.toLowerCase() === clean.toLowerCase())
      );
      if (orderContainingItem) {
        setCustomerOrders((prev) =>
          prev.map((o) => (o.id === orderContainingItem.id ? { ...o, isAtDesk: true } : o))
        );
        setActiveTab('handover');
        setSelectedCell(orderContainingItem.cellNumber);
        setActiveOrderId(orderContainingItem.id);
        soundManager.playOrderOpenSequence({
          cellNumber: orderContainingItem.cellNumber,
          goodsCount: orderContainingItem.items.length,
          isPaid: orderContainingItem.paymentType === 'online' || orderContainingItem.isPaid === true,
          hasTryOnAfterPayment: orderContainingItem.hasTryOnAfterPayment || orderContainingItem.items.some((i) => i.tryOnAfterPayment),
          isWbClub: orderContainingItem.isWbClub,
          isPriority: orderContainingItem.isPriority,
        });
        return;
      }

      // 6. Check if code matches an incoming acceptance item
      const matchedAcceptanceItem = acceptanceItems.find(
        (ai) => ai.barcode.toLowerCase() === clean.toLowerCase() || ai.itemCode.includes(clean)
      );
      if (matchedAcceptanceItem) {
        soundManager.play('scan-success');
        soundManager.announceNewCell(matchedAcceptanceItem.cellNumber);
        setAcceptanceItems((prev) => prev.filter((ai) => ai.id !== matchedAcceptanceItem.id));
        return;
      }

      // 7. Otherwise, fallback acceptance item scan
      soundManager.play('scan');
      const randomCell = Math.floor(100 + Math.random() * 899).toString();
      const newItem: AcceptanceItem = {
        id: `acc-${Date.now()}`,
        cellNumber: randomCell,
        clientItemsOnCell: 1,
        itemCode: `${Math.floor(100000000 + Math.random() * 900000000)} ${clean.slice(-4) || '5879'}`,
        title: `Товар (${clean})`,
        color: 'Розовый, Серый',
        size: 'XL',
        barcode: clean,
        type: 'custom',
      };
      setAcceptanceItems((prev) => [newItem, ...prev]);
    },
    [activeTab, customerOrders, activeOrderId, boxContents, acceptanceItems]
  );

  const { isHardwareActive } = useBarcodeScanner({
    settings: scannerSettings,
    onScan: handleHardwareScan,
    enabled: true,
  });

  const openCameraScanner = (
    title: string,
    hint: string,
    manualLabel: string,
    onResult: (code: string) => void
  ) => {
    setCameraScannerProps({
      isOpen: true,
      title,
      hint,
      manualLabel,
      onResult,
    });
  };

  const handleExportData = () => {
    const data = { acceptanceItems, customerOrders, scannerSettings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wb-point-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.acceptanceItems) setAcceptanceItems(parsed.acceptanceItems);
        if (parsed.customerOrders) setCustomerOrders(parsed.customerOrders);
        if (parsed.scannerSettings) setScannerSettings(parsed.scannerSettings);
        soundManager.play('success');
      } catch {
        soundManager.play('refusal');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAllData = () => {
    setAcceptanceItems(INITIAL_ACCEPTANCE_ITEMS);
    setCustomerOrders(INITIAL_CUSTOMER_ORDERS);
    setActiveOrderId(null);
    soundManager.play('success');
  };

  const handleOpenOrderAtDesk = useCallback(
    (orderId?: string) => {
      setActiveTab('handover');
      if (!orderId) return;

      setCustomerOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, isAtDesk: true } : o))
      );
      const ord = customerOrders.find((o) => o.id === orderId);
      if (ord) {
        setActiveOrderId(orderId);
        setSelectedCell(ord.cellNumber);
        soundManager.playOrderOpenSequence({
          cellNumber: ord.cellNumber,
          goodsCount: ord.items.length,
          isPaid: ord.paymentType === 'online' || ord.isPaid === true,
          hasTryOnAfterPayment: ord.hasTryOnAfterPayment || ord.items.some((i) => i.tryOnAfterPayment),
          isWbClub: ord.isWbClub,
          isPriority: ord.isPriority,
        });
      }
    },
    [customerOrders]
  );

  const handleSelectCell = (cell: string) => {
    setSelectedCell(cell);
    const ord = customerOrders.find((o) => o.cellNumber === cell && o.isAtDesk);
    if (ord) {
      setActiveOrderId(ord.id);
    } else {
      setActiveOrderId(null);
    }
  };

  // Only cells that actually have active orders AT THE COUNTER (isAtDesk && !isIssued && status !== 'issued') in customerOrders!
  const cellList: CellItemSummary[] = useMemo(() => {
    const map = new Map<string, number>();
    customerOrders
      .filter((o) => o.isAtDesk && o.status !== 'issued' && !o.isIssued)
      .forEach((o) => {
        const activeCount = o.items.filter((i) => i.status !== 'rejected' && i.status !== 'issued').length || o.packagesCount || 0;
        if (activeCount > 0) {
          map.set(o.cellNumber, activeCount);
        }
      });

    return Array.from(map.entries()).map(([cell, count]) => ({ cell, count }));
  }, [customerOrders]);

  // Synchronize activeOrderId and selectedCell with active desk orders
  useEffect(() => {
    const deskOrders = customerOrders.filter((o) => o.isAtDesk);
    if (deskOrders.length === 0) {
      if (activeOrderId !== null) setActiveOrderId(null);
      if (selectedCell !== '') setSelectedCell('');
      return;
    }

    const currentOrder = deskOrders.find((o) => o.id === activeOrderId);
    if (!currentOrder) {
      // Current order is no longer at desk, switch to the first available desk order
      setActiveOrderId(deskOrders[0].id);
      setSelectedCell(deskOrders[0].cellNumber);
    } else if (selectedCell !== currentOrder.cellNumber) {
      setSelectedCell(currentOrder.cellNumber);
    }
  }, [customerOrders, activeOrderId, selectedCell]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#1c1c1e] flex flex-col font-sans overflow-x-hidden antialiased select-none">
      {/* 1. TopBar matching wb_point_emulator.html */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        onOpenManualInput={() => setIsManualModalOpen(true)}
        onOpenScannerSettings={() => setIsScannerSettingsOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        pickupCount={customerOrders.length}
        acceptanceCount={acceptanceItems.length}
        returnCount={defects.length + repackedItems.length || 8}
        lastScannedCode={lastScannedCode}
      />

      {/* 2. Main Workstation Area: LeftSidebar + Content */}
      <div className="flex-1 flex min-h-[calc(100vh-56px)]">
        {/* Left Sidebar matching wb_point_emulator.html */}
        <LeftSidebar
          activeTab={activeTab}
          acceptanceSubTab={acceptanceSubTab}
          setAcceptanceSubTab={setAcceptanceSubTab}
          returnSubTab={returnSubTab}
          setReturnSubTab={setReturnSubTab}
          selectedCell={selectedCell}
          setSelectedCell={handleSelectCell}
          cellList={cellList}
          onOpenChangePvz={() => setIsChangePvzOpen(true)}
          onAddClient={() => setIsCreateOrderModalOpen(true)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5] text-[#1c1c1e] overflow-y-auto">
          {/* Handover / Issuance Tab */}
          {activeTab === 'handover' && (
            <div className="p-4 md:p-6 flex-1">
              <IssuanceView
                orders={customerOrders}
                setOrders={setCustomerOrders}
                activeOrderId={activeOrderId}
                setActiveOrderId={setActiveOrderId}
                scannerSettings={scannerSettings}
                onOpenScanner={openCameraScanner}
                selectedCell={selectedCell}
                onSelectCell={handleSelectCell}
                onSendToReturnBox={(barcode) => {
                  setActiveTab('return');
                  setReturnSubTab('boxes');
                  soundManager.play('return-accepted');
                }}
              />
            </div>
          )}

          {/* Acceptance Tab */}
          {activeTab === 'acceptance' && (
            <div className="flex-1 flex flex-col min-w-0">
              {acceptanceSubTab === 'items' && (
                <AcceptanceView
                  items={acceptanceItems}
                  setItems={setAcceptanceItems}
                  customerOrders={customerOrders}
                  setCustomerOrders={setCustomerOrders}
                  subTab={acceptanceSubTab}
                  onOpenSupplyModal={(code, title) =>
                    setSupplyModalProps({ isOpen: true, code, title })
                  }
                  onNavigateToIssuance={handleOpenOrderAtDesk}
                  onOpenManualInput={() => setIsManualModalOpen(true)}
                  onOpenQrGenerator={() => setIsQrModalOpen(true)}
                  onOpenScanner={() =>
                    openCameraScanner(
                      'Сканирование товара поставки',
                      'Наведите камеру на стикер товара',
                      'Штрихкод товара:',
                      (code) => handleHardwareScan(code)
                    )
                  }
                />
              )}

              {acceptanceSubTab === 'change_cell' && (
                <div className="p-4 md:p-6 flex-1">
                  <CellManagerView />
                </div>
              )}
              {acceptanceSubTab === 'reaccept' && (
                <AcceptanceView
                  items={acceptanceItems}
                  setItems={setAcceptanceItems}
                  customerOrders={customerOrders}
                  setCustomerOrders={setCustomerOrders}
                  subTab="reaccept"
                  onOpenSupplyModal={(code, title) =>
                    setSupplyModalProps({ isOpen: true, code, title })
                  }
                  onNavigateToIssuance={handleOpenOrderAtDesk}
                  onOpenManualInput={() => setIsManualModalOpen(true)}
                />
              )}
              {acceptanceSubTab === 'courier' && (
                <div className="p-4 md:p-6 flex-1">
                  <CourierDispatchView boxContents={boxContents} />
                </div>
              )}
              {acceptanceSubTab === 'dbs' && (
                <div className="bg-white rounded-3xl border border-[#e8e8ed] p-12 max-w-xl mx-auto shadow-xs text-center space-y-3 m-6 animate-fade-in">
                  <span className="text-5xl block">🏪</span>
                  <h3 className="text-2xl font-black text-gray-900">
                    DBS Доставка со склада продавца
                  </h3>
                  <p className="text-xs text-gray-500">
                    Заказы по схеме Delivery by Seller в текущую смену отсутствуют.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Return Tab */}
          {activeTab === 'return' && (
            <div className="flex-1 flex flex-col min-w-0">
              {returnSubTab === 'items' && (
                <ReturnsView onOpenScanner={openCameraScanner} subTab={returnSubTab} />
              )}
              {returnSubTab === 'boxes' && (
                <div className="p-4 md:p-6 flex-1">
                  <CourierDispatchView boxContents={boxContents} />
                </div>
              )}
              {returnSubTab === 'wb_mp' && (
                <div className="bg-white rounded-3xl border border-[#e8e8ed] p-12 max-w-xl mx-auto shadow-xs text-center space-y-3 m-6 animate-fade-in">
                  <img src="/mp_box.svg" alt="" className="w-16 h-16 mx-auto object-contain mb-2" />
                  <h3 className="text-2xl font-black text-gray-900">
                    Возвраты WB MP (Маркетплейс)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Формирование партий возвратов товаров селлеров маркетплейса на РЦ.
                  </p>
                </div>
              )}
              {returnSubTab === 'cardboard' && (
                <div className="bg-white rounded-3xl border border-[#e8e8ed] p-12 max-w-xl mx-auto shadow-xs text-center space-y-3 m-6 animate-fade-in">
                  <img src="/recycle.svg" alt="" className="w-16 h-16 mx-auto object-contain mb-2" />
                  <h3 className="text-2xl font-black text-gray-900">
                    Сбор и передача вторсырья (Картон)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Прессование и подготовка к вывозу картонной тары и упаковочных коробок.
                  </p>
                </div>
              )}
              {returnSubTab === 'waste' && (
                <div className="p-4 md:p-6 flex-1">
                  <DefectManagementView />
                </div>
              )}
            </div>
          )}

          {/* More / Warehouse Tab */}
          {activeTab === 'more' && (
            <div className="p-4 md:p-6 flex-1">
              <MoreHubView
                key={moreSubModule}
                initialSubModule={moreSubModule}
                boxContents={boxContents}
                setBoxContents={setBoxContents}
                registeredStickers={registeredStickers}
                setRegisteredStickers={setRegisteredStickers}
                repackedItems={repackedItems}
                setRepackedItems={setRepackedItems}
                defects={defects}
                setDefects={setDefects}
                surpluses={surpluses}
                setSurpluses={setSurpluses}
                automenus={automenus}
                setAutomenus={setAutomenus}
                scannerSettings={scannerSettings}
                setScannerSettings={setScannerSettings}
                onOpenScanner={openCameraScanner}
                onExportData={handleExportData}
                onImportData={handleImportData}
                onClearAllData={handleClearAllData}
                customerOrders={customerOrders}
                setCustomerOrders={setCustomerOrders}
                onNavigateToIssuance={handleOpenOrderAtDesk}
              />
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Drawer Menu */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenSettings={() => setIsScannerSettingsOpen(true)}
        onOpenGenerator={() => {
          setActiveTab('more');
          setIsGenerationModalOpen(true);
        }}
        onOpenChangePvz={() => setIsChangePvzOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenManualInput={() => setIsManualModalOpen(true)}
        onOpenQrGenerator={() => setIsQrModalOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
      />

      {/* Change PVZ Modal */}
      <ChangePvzModal
        isOpen={isChangePvzOpen}
        onClose={() => setIsChangePvzOpen(false)}
        currentPvzName={pvzName}
        onChangePvz={(name, id) => {
          setPvzName(name);
          setPvzId(id);
        }}
      />

      {/* Scanner Settings Modal */}
      {isScannerSettingsOpen && (
        <ScannerSettingsModal
          isOpen={isScannerSettingsOpen}
          onClose={() => setIsScannerSettingsOpen(false)}
        />
      )}

      {/* Onboarding Guide Modal (Official WB Course) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartSimulation={() => {
          setActiveTab('acceptance');
          setAcceptanceSubTab('items');
        }}
      />

      {/* Modal: 'Это товар для вашего ПВЗ' (Exact Image 1 Popup) */}
      <PvzSupplyModal
        isOpen={supplyModalProps.isOpen}
        onClose={() => setSupplyModalProps((prev) => ({ ...prev, isOpen: false }))}
        code={supplyModalProps.code}
        title={supplyModalProps.title}
      />

      {/* Camera Scanner Viewfinder */}
      <CameraScannerModal
        isOpen={cameraScannerProps.isOpen}
        title={cameraScannerProps.title}
        hint={cameraScannerProps.hint}
        manualLabel={cameraScannerProps.manualLabel}
        onClose={() => setCameraScannerProps((prev) => ({ ...prev, isOpen: false }))}
        onResult={cameraScannerProps.onResult}
        soundVolume={scannerSettings.soundVolume}
      />

      {/* Emergency Manual Input (F2) with Numpad and Suggestions */}
      <ManualInputModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={handleHardwareScan}
        boxes={[
          { id: 'box-1', barcode: 'WB-BOX-48192', name: 'Коробка №48192 (Обычная)' },
          { id: 'box-2', barcode: 'WB-BOX-55018', name: 'Сейф-пакет №55018 (Электроника)' },
          { id: 'box-3', barcode: 'WB-BOX-77301', name: 'Коробка №77301 (Крупногабарит / КГТ)' },
          ...Object.keys(boxContents).map((code) => ({
            id: `box-${code}`,
            barcode: code,
            name: `Коробка ${code}`,
          })),
        ]}
        items={[
          ...customerOrders.flatMap((o) =>
            o.items.map((it) => ({
              id: it.id,
              barcode: it.code,
              name: it.name,
              clientCode: o.pickupCode,
            }))
          ),
          ...acceptanceItems.map((ai) => ({
            id: ai.id,
            barcode: ai.barcode,
            name: ai.title,
            clientCode: ai.cellNumber,
          })),
        ]}
      />

      {/* Client QR Code and Barcode Generator Modal */}
      {isQrModalOpen && (
        <ClientQrCodeModal
          order={customerOrders.find((o) => o.id === activeOrderId) || customerOrders[0] || null}
          orders={customerOrders}
          onClose={() => setIsQrModalOpen(false)}
          onScanThisQr={(code) => {
            setIsQrModalOpen(false);
            handleHardwareScan(code);
          }}
        />
      )}

      {/* Generator Modal for Inbound Shipments and Customer Orders */}
      <GenerationModal
        isOpen={isGenerationModalOpen}
        onClose={() => setIsGenerationModalOpen(false)}
        onGenerateShipment={handleGenerateShipment}
        onGenerateOrders={handleGenerateOrders}
      />

      {/* Modal: Create Order by WB link */}
      {isCreateOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-2 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#f8f9fa] rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200">
            <CreateOrderView
              customerOrders={customerOrders}
              setCustomerOrders={setCustomerOrders}
              onNavigateToIssuance={(orderId) => {
                setIsCreateOrderModalOpen(false);
                handleOpenOrderAtDesk(orderId);
              }}
              onClose={() => setIsCreateOrderModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal: Interactive Curator Support */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-2 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#f8f9fa] rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 p-4 sm:p-6 relative">
            <CuratorSupportView onClose={() => setIsSupportOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
