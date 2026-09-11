/**
 * Seeds the Casa Fiorelli menu exactly as it existed on the original static site:
 * the same dishes, combos, drinks, prices and weekday specials.
 * Stories attached to each plate are new copy written in the voice of the house.
 */
import { PrismaClient, type Weekday } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DISHES = [
  {
    slug: 'macarrao-bacon-queijo',
    name: 'Macarrão com Bacon e Queijo',
    description:
      'Macarrão parafuso cozido al dente, com carne moída suculenta, cubos crocantes de bacon e finalizado com cheddar derretido.',
    story:
      'Nasceu numa noite de inverno de 1962, quando a nonna Fiorelli improvisou o jantar com o que sobrara da despensa. O bacon salgado encontrou o cheddar, e o improviso virou o prato mais pedido da casa.',
    price: 49.99,
    image: 'macarrao-bacon-queijo',
    tags: ['massa', 'cremoso', 'bacon'],
    prepMinutes: 25,
  },
  {
    slug: 'risoto-camarao-ervilhas',
    name: 'Risoto de Camarão com Ervilhas',
    description:
      'Risoto cremoso, preparado com arroz arbório, ervilhas frescas e camarões dourados na manteiga. Um prato sofisticado, com textura aveludada e sabor marcante.',
    story:
      'Receita trazida do litoral do Vêneto pelo bisavô Enzo, que aprendeu a mexer o arroz sempre no mesmo sentido. Segundo ele, é assim que o risoto guarda o calor de quem cozinha.',
    price: 64.99,
    image: 'risoto-camarao-ervilhas',
    tags: ['risoto', 'frutos do mar', 'especial'],
    prepMinutes: 35,
    featured: true,
  },
  {
    slug: 'fettuccine-cogumelos',
    name: 'Fettuccine com Cogumelos',
    description:
      'Fettuccine ao dente, envolto em um molho cremoso, com cogumelos salteados e finalizado com lascas de parmesão.',
    story:
      'No outono, a família subia a serra para colher cogumelos frescos. O que voltava na cesta virava este molho, servido com a massa aberta à mão na mesma manhã.',
    price: 54.99,
    image: 'fettuccine-cogumelos',
    tags: ['massa', 'cogumelos', 'cremoso'],
    vegetarian: true,
    prepMinutes: 25,
  },
  {
    slug: 'conchiglione-ricota-espinafre',
    name: 'Conchiglione com Ricota e Espinafre',
    description:
      'Massa tipo concha recheada com ricota cremosa e espinafre fresco, servida ao molho de tomate rústico.',
    story:
      'Cada concha é recheada à mão, uma a uma, como a bisnonna Lucia fazia nas manhãs de domingo enquanto esperava os netos chegarem.',
    price: 64.99,
    image: 'conchiglione-ricota-espinafre',
    tags: ['massa', 'vegetariano', 'recheado'],
    vegetarian: true,
    prepMinutes: 30,
  },
  {
    slug: 'espaguete-bolonhesa',
    name: 'Espaguete à Bolonhesa',
    description: 'Espaguete italiano com molho bolonhesa preparado com carne moída, tomate fresco e especiarias.',
    story:
      'O molho cozinha por quatro horas em fogo baixo, do mesmo jeito desde 1945. É o primeiro prato que todo cozinheiro da casa aprende, e o último que ele domina.',
    price: 64.99,
    image: 'espaguete-bolonhesa',
    tags: ['massa', 'clássico', 'carne'],
    prepMinutes: 25,
    featured: true,
  },
  {
    slug: 'fettuccine-alfredo-frango',
    name: 'Fettuccine Alfredo com Frango',
    description: 'Fettuccine envolvido em um cremoso molho Alfredo, com peito de frango grelhado.',
    story:
      'Manteiga, parmesão e paciência: o molho é montado na frigideira, fora do fogo, para que fique sedoso sem talhar. Simples como as coisas boas costumam ser.',
    price: 54.99,
    image: 'fettuccine-alfredo-frango',
    tags: ['massa', 'frango', 'cremoso'],
    prepMinutes: 25,
  },
  {
    slug: 'lasanha-carne-queijo',
    name: 'Lasanha de Carne e Queijo',
    description:
      'Camadas de massa com molho bolonhesa, carne moída, molho de tomate e queijo derretido, gratinada até borbulhar.',
    story:
      'São sete camadas, nunca seis. O nonno dizia que a sétima é a que se oferece a quem chega de surpresa, e na Casa Fiorelli sempre chega alguém.',
    price: 74.99,
    image: 'lasanha-carne-queijo',
    tags: ['forno', 'carne', 'queijo'],
    prepMinutes: 40,
    serves: 2,
    featured: true,
  },
  {
    slug: 'salada-caprese-macarrao',
    name: 'Salada Caprese de Macarrão',
    description: 'Macarrão parafuso frio com tomate cereja, muçarela, manjericão e azeite.',
    story:
      'Inspirada nas cores da bandeira italiana e nos verões de Capri: tomate, muçarela e manjericão colhido no vaso da janela da cozinha.',
    price: 54.99,
    image: 'salada-caprese-macarrao',
    tags: ['leve', 'vegetariano', 'fria'],
    vegetarian: true,
    prepMinutes: 15,
  },
  {
    slug: 'batata-cremosa-calabresa',
    name: 'Batata Cremosa com Calabresa',
    description: 'Batata cozida em molho cremoso de queijo com linguiça calabresa e salsa fresca.',
    story:
      'A receita que a casa serve aos próprios funcionários antes de abrir as portas. Entrou no cardápio porque os clientes sentiam o cheiro da cozinha e pediam “aquele mesmo”.',
    price: 49.99,
    image: 'batata-cremosa-calabresa',
    tags: ['forno', 'cremoso', 'calabresa'],
    prepMinutes: 30,
  },
  {
    slug: 'penne-pesto-brocolis',
    name: 'Penne ao Pesto com Brócolis',
    description: 'Penne cozido com frango grelhado, brócolis crocante e molho pesto artesanal.',
    story:
      'O pesto é socado no pilão de mármore, nunca no liquidificador: o calor da lâmina roubaria o verde do manjericão e o perfume que faz o prato.',
    price: 64.99,
    image: 'penne-pesto-brocolis',
    tags: ['massa', 'pesto', 'frango'],
    prepMinutes: 25,
  },
]

const COMBOS = [
  {
    slug: 'combo-do-mar',
    name: 'Combo do Mar',
    description: 'Risoto de camarão com ervilhas e penne ao pesto com brócolis. Leveza e sabor com um toque do mar!',
    price: 99.99,
    image: 'risoto-camarao-ervilhas',
    serves: 2,
  },
  {
    slug: 'combo-classico',
    name: 'Combo Clássico',
    description: 'Lasanha bolonhesa e fettuccine Alfredo com frango. Sabores tradicionais para matar a fome!',
    price: 84.99,
    image: 'lasanha-carne-queijo',
    serves: 2,
    featured: true,
  },
  {
    slug: 'combo-cheddar',
    name: 'Combo Cheddar',
    description:
      'Macarrão com bacon e queijo, acompanhado de batata cremosa com calabresa. Para quem ama muito cheddar!',
    price: 89.99,
    image: 'macarrao-bacon-queijo',
    serves: 2,
  },
  {
    slug: 'combo-vegetariano',
    name: 'Combo Vegetariano',
    description: 'Conchiglione com ricota e espinafre, e salada caprese de macarrão. Opção sem carne, mas cheia de sabor!',
    price: 79.99,
    image: 'conchiglione-ricota-espinafre',
    serves: 2,
    vegetarian: true,
  },
  {
    slug: 'combo-premium',
    name: 'Combo Premium',
    description:
      'Risoto de camarão com ervilhas, fettuccine com cogumelos e batata cremosa com calabresa. Uma seleção especial para quem busca o melhor!',
    price: 124.99,
    image: 'fettuccine-cogumelos',
    serves: 3,
    featured: true,
  },
  {
    slug: 'combo-italiano',
    name: 'Combo Italiano',
    description: 'Espaguete à bolonhesa e salada caprese de macarrão. Uma combinação clássica e deliciosa!',
    price: 89.99,
    image: 'espaguete-bolonhesa',
    serves: 2,
  },
  {
    slug: 'combo-conchiglione-refri-lata',
    name: 'Combo Conchiglione + Refri lata',
    description: 'Conchiglione com ricota e espinafre, acompanhado de um refrigerante gelado. Leve, saboroso e refrescante!',
    price: 65.0,
    image: 'conchiglione-ricota-espinafre',
    vegetarian: true,
  },
  {
    slug: 'combo-alfredo-refri-lata',
    name: 'Combo Alfredo + Refri lata',
    description: 'Fettuccine Alfredo com frango grelhado, mais um refrigerante gelado. Clássico, saboroso e na medida certa!',
    price: 55.0,
    image: 'fettuccine-alfredo-frango',
  },
  {
    slug: 'combo-cremoso-refri-2l',
    name: 'Combo Cremoso + Refri 2 litros',
    description: 'Macarrão com bacon e queijo, mais um refrigerante gelado. Combinação irresistível para quem ama cremosidade!',
    price: 60.0,
    image: 'macarrao-bacon-queijo',
    serves: 2,
  },
]

const DRINKS = [
  {
    slug: 'coca-cola-lata',
    name: 'Coca-Cola lata',
    description:
      'A tradicional e inconfundível Coca-Cola, com seu sabor original e refrescante. Perfeita para acompanhar qualquer momento.',
    price: 7.0,
    image: 'coca-cola-lata',
  },
  {
    slug: 'coca-cola-zero-lata',
    name: 'Coca-Cola sem açúcar lata',
    description: 'Todo o sabor marcante da Coca-Cola, mas sem açúcar. Ideal para quem busca uma opção mais leve.',
    price: 7.0,
    image: 'coca-cola-zero-lata',
  },
  {
    slug: 'fanta-laranja-lata',
    name: 'Fanta Laranja lata',
    description: 'Com um sabor vibrante e natural de laranja, Fanta Laranja é sinônimo de alegria e refrescância.',
    price: 7.0,
    image: 'fanta-laranja-lata',
  },
  {
    slug: 'fanta-uva-lata',
    name: 'Fanta Uva lata',
    description: 'Refrescante e divertida, Fanta Uva tem um sabor intenso de uva e um toque adocicado.',
    price: 7.0,
    image: 'fanta-uva-lata',
  },
  {
    slug: 'guarana-antarctica-lata',
    name: 'Guaraná Antarctica lata',
    description: 'O autêntico sabor brasileiro! Feito com extrato natural da fruta, levemente adocicado.',
    price: 7.0,
    image: 'guarana-antarctica-lata',
  },
  {
    slug: 'guarana-antarctica-zero-lata',
    name: 'Guaraná Antarctica sem açúcar lata',
    description: 'Todo o sabor do tradicional Guaraná, mas sem adição de açúcar. Uma escolha equilibrada.',
    price: 7.0,
    image: 'guarana-antarctica-zero-lata',
  },
  {
    slug: 'sprite-lata',
    name: 'Sprite lata',
    description: 'Refrescante e cítrico, Sprite combina limão e lima com um gás leve e revigorante.',
    price: 7.0,
    image: 'sprite-lata',
  },
  {
    slug: 'sprite-zero-lata',
    name: 'Sprite sem açúcar lata',
    description: 'A mesma refrescância de Sprite, agora sem açúcar. Leve e cítrica, sem abrir mão do sabor.',
    price: 7.0,
    image: 'sprite-zero-lata',
  },
  {
    slug: 'coca-cola-2l',
    name: 'Coca-Cola 2 litros',
    description: 'A clássica Coca-Cola na versão ideal para compartilhar com amigos e família.',
    price: 15.0,
    image: 'coca-cola-2l',
    serves: 4,
  },
  {
    slug: 'coca-cola-zero-2l',
    name: 'Coca-Cola sem açúcar 2 litros',
    description: 'A refrescância da Coca-Cola sem açúcar, no tamanho ideal para dividir com quem você gosta.',
    price: 15.0,
    image: 'coca-cola-zero-2l',
    serves: 4,
  },
  {
    slug: 'fanta-laranja-2l',
    name: 'Fanta Laranja 2 litros',
    description: 'Dois litros de pura refrescância: sabor vibrante e frutado para animar qualquer encontro.',
    price: 12.0,
    image: 'fanta-laranja-2l',
    serves: 4,
  },
  {
    slug: 'fanta-uva-2l',
    name: 'Fanta Uva 2 litros',
    description: 'Muito mais sabor de uva para compartilhar, com toda a diversão que a ocasião pede.',
    price: 12.0,
    image: 'fanta-uva-2l',
    serves: 4,
  },
  {
    slug: 'sprite-2l',
    name: 'Sprite 2 litros',
    description: 'A refrescância do limão com o gás na medida certa, em uma versão para dividir.',
    price: 12.0,
    image: 'sprite-2l',
    serves: 4,
  },
  {
    slug: 'guarana-antarctica-2l',
    name: 'Guaraná Antarctica 2 litros',
    description: 'O verdadeiro sabor brasileiro em tamanho família, perfeito para encontros e momentos especiais.',
    price: 14.0,
    image: 'guarana-antarctica-2l',
    serves: 4,
  },
]

/** Weekday specials, transcribed from the carousel art of the original site. */
const PROMOTIONS: Array<{
  weekday: Weekday
  title: string
  subtitle: string
  description: string
  image: string
}> = [
  {
    weekday: 'TUESDAY',
    title: 'Destaque de terça',
    subtitle: 'Espaguete à Bolonhesa',
    description:
      'O tradicional espaguete italiano com molho bolonhesa, preparado com carne moída, tomate fresco e especiarias. Sabor ideal para quem ama tradição. Por apenas R$ 54,99.',
    image: 'terca',
  },
  {
    weekday: 'WEDNESDAY',
    title: 'Destaque de quarta',
    subtitle: 'Penne ao Pesto com Brócolis',
    description:
      'Penne cozido, com pedaços de frango grelhado, brócolis crocante e molho pesto artesanal. Um prato equilibrado, para quem gosta de sabores marcantes! Por apenas R$ 54,99.',
    image: 'quarta',
  },
  {
    weekday: 'THURSDAY',
    title: 'Destaque de quinta',
    subtitle: 'Macarrão com Bacon e Queijo',
    description:
      'Macarrão parafuso cozido, com carne suculenta, cubos crocantes de bacon e uma generosa camada de cheddar derretido. Por apenas R$ 39,99.',
    image: 'quinta',
  },
  {
    weekday: 'FRIDAY',
    title: 'Destaque de sexta',
    subtitle: 'Lasanha à Bolonhesa',
    description:
      'Camadas de massa intercaladas com molho bolonhesa, carne moída, molho de tomate e muito queijo derretido. Por apenas R$ 59,99.',
    image: 'sexta',
  },
  {
    weekday: 'SATURDAY',
    title: 'Destaque de sábado',
    subtitle: 'Risoto de Camarão com Ervilhas',
    description:
      'Risoto cremoso, preparado com arroz arbório e camarões dourados na manteiga. Um prato sofisticado, com textura aveludada. Por apenas R$ 54,99.',
    image: 'sabado',
  },
  {
    weekday: 'SUNDAY',
    title: 'Destaque de domingo',
    subtitle: 'Fettuccine Alfredo com Frango',
    description:
      'Fettuccine envolvido em um cremoso molho Alfredo, com frango grelhado no ponto perfeito. Cremoso, macio e simplesmente irresistível! Por apenas R$ 49,99.',
    image: 'domingo',
  },
]

async function main() {
  console.log('Cleaning previous data...')

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.userCoupon.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.address.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.contactMessage.deleteMany()
  await prisma.user.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.promotion.deleteMany()

  console.log('Seeding categories...')

  const pratos = await prisma.category.create({
    data: {
      slug: 'pratos',
      name: 'Pratos',
      tagline: 'A cozinha da casa',
      description: 'Massas, risotos e assados preparados no dia, do jeito que a família Fiorelli aprendeu a fazer.',
      imageUrl: '/img/categories/pratos.webp',
      position: 1,
    },
  })

  const combos = await prisma.category.create({
    data: {
      slug: 'combos',
      name: 'Combos',
      tagline: 'Para dividir à mesa',
      description: 'Combinações pensadas para quem chega acompanhado, porque comida italiana pede companhia.',
      imageUrl: '/img/categories/combos.webp',
      position: 2,
    },
  })

  const bebidas = await prisma.category.create({
    data: {
      slug: 'bebidas',
      name: 'Bebidas',
      tagline: 'Para acompanhar',
      description: 'Refrigerantes gelados em lata ou dois litros, para brindar do jeito mais simples.',
      imageUrl: '/img/categories/bebidas.webp',
      position: 3,
    },
  })

  console.log('Seeding menu items...')

  await prisma.menuItem.createMany({
    data: DISHES.map((dish, index) => ({
      categoryId: pratos.id,
      slug: dish.slug,
      name: dish.name,
      description: dish.description,
      story: dish.story,
      price: dish.price,
      imageUrl: '/img/dishes/' + dish.image + '.webp',
      featured: dish.featured ?? false,
      vegetarian: dish.vegetarian ?? false,
      serves: dish.serves ?? 1,
      prepMinutes: dish.prepMinutes,
      tags: dish.tags,
      position: index + 1,
    })),
  })

  await prisma.menuItem.createMany({
    data: COMBOS.map((combo, index) => ({
      categoryId: combos.id,
      slug: combo.slug,
      name: combo.name,
      description: combo.description,
      story: 'Um combo montado para a mesa cheia: pratos que se completam, servidos juntos por um preço de casa.',
      price: combo.price,
      imageUrl: '/img/dishes/' + combo.image + '.webp',
      featured: combo.featured ?? false,
      vegetarian: combo.vegetarian ?? false,
      serves: combo.serves ?? 1,
      prepMinutes: 35,
      tags: ['combo'],
      position: index + 1,
    })),
  })

  await prisma.menuItem.createMany({
    data: DRINKS.map((drink, index) => ({
      categoryId: bebidas.id,
      slug: drink.slug,
      name: drink.name,
      description: drink.description,
      price: drink.price,
      imageUrl: '/img/drinks/' + drink.image + '.webp',
      vegetarian: true,
      serves: drink.serves ?? 1,
      prepMinutes: 2,
      tags: ['bebida'],
      position: index + 1,
    })),
  })

  console.log('Seeding weekday specials...')

  await prisma.promotion.createMany({
    data: PROMOTIONS.map((promotion, index) => ({
      weekday: promotion.weekday,
      title: promotion.title,
      subtitle: promotion.subtitle,
      description: promotion.description,
      imageUrl: '/img/promos/' + promotion.image + '.webp',
      position: index + 1,
    })),
  })

  console.log('Seeding coupons...')

  const welcome = await prisma.coupon.create({
    data: {
      code: 'BENVENUTO10',
      description: '10% de desconto no seu primeiro pedido.',
      type: 'PERCENTAGE',
      value: 10,
      minSubtotal: 50,
    },
  })

  const famiglia = await prisma.coupon.create({
    data: {
      code: 'FAMIGLIA20',
      description: 'R$ 20 de desconto em pedidos acima de R$ 150.',
      type: 'FIXED',
      value: 20,
      minSubtotal: 150,
    },
  })

  console.log('Seeding demo customer...')

  const passwordHash = await bcrypt.hash('casafiorelli', 10)

  const diana = await prisma.user.create({
    data: {
      name: 'Diana Pacheco',
      email: 'diana@casafiorelli.com.br',
      phone: '12988887777',
      passwordHash,
      balance: 120,
      cart: { create: {} },
      addresses: {
        create: [
          {
            label: 'Casa',
            street: 'Avenida Dom Pedro',
            number: '202',
            district: 'Centro',
            city: 'Taubaté',
            state: 'SP',
            zipCode: '12010-000',
            isDefault: true,
          },
          {
            label: 'Trabalho',
            street: 'Rua Barão da Pedra Negra',
            number: '48',
            complement: 'Sala 12',
            district: 'Centro',
            city: 'Taubaté',
            state: 'SP',
            zipCode: '12010-100',
          },
        ],
      },
      paymentMethods: {
        create: [
          { type: 'CREDIT_CARD', label: 'Visa final 4242', holder: 'DIANA PACHECO', last4: '4242', expMonth: 8, expYear: 2030, isDefault: true },
          { type: 'PIX', label: 'Pix (chave e-mail)' },
        ],
      },
      notifications: {
        create: [
          { title: 'Benvenuto alla Casa Fiorelli!', body: 'Sua conta foi criada. Que tal começar pelo destaque do dia?' },
          { title: 'Seu cupom chegou', body: 'Use BENVENUTO10 e ganhe 10% no próximo pedido.' },
        ],
      },
      coupons: { create: [{ couponId: welcome.id }, { couponId: famiglia.id }] },
    },
  })

  const admin = await prisma.user.create({
    data: {
      name: 'Marco Fiorelli',
      email: 'admin@casafiorelli.com.br',
      phone: '1240028922',
      passwordHash,
      role: 'ADMIN',
      cart: { create: {} },
    },
  })

  console.log('Seeding order history...')

  const risoto = await prisma.menuItem.findUniqueOrThrow({ where: { slug: 'risoto-camarao-ervilhas' } })
  const guarana = await prisma.menuItem.findUniqueOrThrow({ where: { slug: 'guarana-antarctica-lata' } })
  const bacon = await prisma.menuItem.findUniqueOrThrow({ where: { slug: 'macarrao-bacon-queijo' } })
  const cogumelos = await prisma.menuItem.findUniqueOrThrow({ where: { slug: 'fettuccine-cogumelos' } })

  const homeAddress = await prisma.address.findFirstOrThrow({ where: { userId: diana.id, isDefault: true } })
  const card = await prisma.paymentMethod.findFirstOrThrow({ where: { userId: diana.id, isDefault: true } })

  await prisma.order.create({
    data: {
      code: 'CF-9K3D2A',
      userId: diana.id,
      addressId: homeAddress.id,
      paymentMethodId: card.id,
      status: 'COMPLETED',
      subtotal: 71.99,
      deliveryFee: 8.9,
      total: 80.89,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
      items: {
        create: [
          { menuItemId: risoto.id, name: risoto.name, imageUrl: risoto.imageUrl, unitPrice: risoto.price, quantity: 1 },
          { menuItemId: guarana.id, name: guarana.name, imageUrl: guarana.imageUrl, unitPrice: guarana.price, quantity: 1 },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      code: 'CF-4M8P1T',
      userId: diana.id,
      addressId: homeAddress.id,
      paymentMethodId: card.id,
      status: 'DELIVERING',
      subtotal: 104.98,
      deliveryFee: 0,
      total: 104.98,
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      items: {
        create: [
          { menuItemId: bacon.id, name: bacon.name, imageUrl: bacon.imageUrl, unitPrice: bacon.price, quantity: 1 },
          { menuItemId: cogumelos.id, name: cogumelos.name, imageUrl: cogumelos.imageUrl, unitPrice: cogumelos.price, quantity: 1 },
        ],
      },
    },
  })

  console.log('Seed complete.')
  console.log('  cliente: diana@casafiorelli.com.br / casafiorelli')
  console.log('  admin:   ' + admin.email + ' / casafiorelli')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
