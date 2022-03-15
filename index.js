const {
    writeFileSync,
    readdirSync,
    rmSync,
    existsSync,
    mkdirSync
} = require('fs');

const { join } = require('path');

const {
    SIZE,
    ANGLE_MIN,
    ANGLE_MAX,
    DESCRIPTION,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    SYMBOL,
    ROYALTIES_PERCENTAGE_BASIS_POINTS,
    SOLANA_WALLET_ADDRESS,
    SEPARATE_DIRECTORY_FOR_JSON,
    COLLECTION_NAME,
    FOLDER_BUILD_NAME
} = require('./constants');

const { getRandomColor, generateGradient, getRandomInt } = require('./utils');

const log = console.log;
let existedMeta = [];

const cleanUp = () => {
    log('Cleaning up...');

    if (!existsSync(join(__dirname, FOLDER_BUILD_NAME))) return;

    readdirSync(join(__dirname, FOLDER_BUILD_NAME)).forEach((f) =>
        rmSync(`${join(__dirname, FOLDER_BUILD_NAME, `${f}`)}`, {
            recursive: true,
            force: true
        })
    );

    rmSync(`${join(__dirname, FOLDER_BUILD_NAME)}`, {
        recursive: true,
        force: true
    });
};

const prepare = () => {
    log('Preparing...');
    if (!existsSync(`./${FOLDER_BUILD_NAME}`)) {
        mkdirSync(join(__dirname, FOLDER_BUILD_NAME));
        if (SEPARATE_DIRECTORY_FOR_JSON) {
            mkdirSync(join(__dirname, FOLDER_BUILD_NAME, 'images'));
            mkdirSync(join(__dirname, FOLDER_BUILD_NAME, 'json'));
        }
    }
};

const generateMeta = (i, index, colors, angle) => {
    return {
        name: `Gradient #${index}`,
        symbol: SYMBOL,
        image: `${i}.png`,
        seller_fee_basis_points: ROYALTIES_PERCENTAGE_BASIS_POINTS,
        description: `${DESCRIPTION} ${index}/${SIZE}.`,
        properties: {
            files: [{ uri: `${i}.png`, type: 'image/png' }],
            category: 'image',
            creators: [
                {
                    address: SOLANA_WALLET_ADDRESS,
                    share: 100
                }
            ]
        },
        attributes: [
            {
                trait_type: 'First color',
                value: colors[0]
            },
            {
                trait_type: 'Second color',
                value: colors[1]
            },
            {
                trait_type: 'Angle',
                value: angle
            }
        ],
        collection: { name: COLLECTION_NAME, family: COLLECTION_NAME }
    };
};

const generateNFT = (i) => {
    let index = i;
    index++;

    const colors = [getRandomColor(), getRandomColor()];

    let angle = getRandomInt(ANGLE_MIN, ANGLE_MAX);

    const meta = generateMeta(i, index, colors, angle);

    for (let metaIndex = 0; metaIndex < existedMeta.length; ++metaIndex) {
        if (
            existedMeta[metaIndex].attributes[0].value ===
                meta.attributes[0].value &&
            existedMeta[metaIndex].attributes[1].value ===
                meta.attributes[1].value
        ) {
            log('Found a double! Generating another one!');
            return generateNFT(i);
        }
    }

    existedMeta.push(meta);

    const buffer = generateGradient(
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        meta.attributes[0].value,
        meta.attributes[1].value,
        meta.attributes[2].value
    );

    return [meta, buffer];
};

const generator = () => {
    log('Started generating...');

    for (let i = 0; i < SIZE; i++) {
        const [meta, buffer] = generateNFT(i);

        if (SEPARATE_DIRECTORY_FOR_JSON) {
            writeFileSync(
                join(__dirname, FOLDER_BUILD_NAME, 'images', `${i}.png`),
                buffer
            );
            writeFileSync(
                join(__dirname, FOLDER_BUILD_NAME, 'json', `${i}.json`),
                JSON.stringify(meta)
            );
        } else {
            writeFileSync(
                join(__dirname, FOLDER_BUILD_NAME, `${i}.png`),
                buffer
            );
            writeFileSync(
                join(__dirname, FOLDER_BUILD_NAME, `${i}.json`),
                JSON.stringify(meta)
            );
        }

        log(`${meta.name} is done.`);
    }
};

const main = async () => {
    cleanUp();
    prepare();
    generator();
};

main();
