-- Rebrands email translation content from Bloom Housing to Affordable Housing Portal.
-- This corrects branding set by migration 40_add_warn_email_translation and ensures
-- any already-migrated environments have up-to-date copy.
--
-- For fresh databases this is a no-op if seeding happens after migration
-- (the seed helpers already use the corrected branding).

-- English
UPDATE
    translations
SET
    translations = jsonb_set(
        translations,
        '{accountRemoval}',
        '{
        "subject": "Scheduled Account Removal Due to Inactivity",
        "courtesyText": "This is a courtesy email to let you know that because your Affordable Housing Portal account has been inactive for 3 years, your account will be deleted in 30 days per our Terms of Use and Privacy Policy. If you''d like to keep your account, please log in sometime in the next month and we''ll consider your account active again.",
        "signIn": "Sign in to Affordable Housing Portal"
        }'
    )
WHERE
    language = 'en';

-- Spanish
UPDATE
    translations
SET
    translations = jsonb_set(
        translations,
        '{accountRemoval}',
        '{
        "subject": "Eliminación programada de cuenta debido a inactividad",
        "courtesyText": "Este es un correo electrónico de cortesía para informarle que, debido a que su cuenta del Portal de Vivienda Asequible ha estado inactiva durante 3 años, se eliminará en 30 días según nuestros Términos de Uso y Política de Privacidad. Si desea conservar su cuenta, inicie sesión durante el próximo mes y la consideraremos activa de nuevo.",
        "signIn": "Iniciar sesión en el Portal de Vivienda Asequible"
        }'
    )
WHERE
    language = 'es';

-- Tagalog
UPDATE
    translations
SET
    translations = jsonb_set(
        translations,
        '{accountRemoval}',
        '{
        "subject": "Nakatakdang Pagtanggal ng Account Dahil sa Kawalan ng Aktibidad",
        "courtesyText": "Ito ay isang courtesy email upang ipaalam sa iyo na dahil ang iyong Affordable Housing Portal account ay hindi aktibo sa loob ng 3 taon, ang iyong account ay tatanggalin sa loob ng 30 araw alinsunod sa aming Mga Tuntunin ng Paggamit at Patakaran sa Privacy. Kung gusto mong panatilihin ang iyong account, mangyaring mag-log in minsan sa susunod na buwan at ituturing naming aktibo muli ang iyong account.",
        "signIn": "Mag-sign in sa Affordable Housing Portal"
        }'
    )
WHERE
    language = 'tl';

-- Vietnamese
UPDATE
    translations
SET
    translations = jsonb_set(
        translations,
        '{accountRemoval}',
        '{
        "subject": "Xóa tài khoản theo lịch trình do không hoạt động",
        "courtesyText": "Đây là email lịch sự để thông báo cho bạn rằng vì tài khoản Affordable Housing Portal của bạn đã không hoạt động trong 3 năm, tài khoản của bạn sẽ bị xóa sau 30 ngày theo Điều khoản Sử dụng và Chính sách Quyền riêng tư của chúng tôi. Nếu bạn muốn giữ lại tài khoản, vui lòng đăng nhập vào thời điểm nào đó trong tháng tới và chúng tôi sẽ coi tài khoản của bạn là hoạt động trở lại.",
        "signIn": "Đăng nhập vào Affordable Housing Portal"
        }'
    )
WHERE
    language = 'vi';

-- Chinese
UPDATE
    translations
SET
    translations = jsonb_set(
        translations,
        '{accountRemoval}',
        '{
        "subject": "因帳戶長期不活躍，計劃刪除您的帳戶",
        "courtesyText": "這是一封通知郵件，告知您由於您的 Affordable Housing Portal 帳戶已連續 3 年未使用，根據我們的使用條款和隱私政策，您的帳戶將在 30 天后被刪除。如果您希望保留您的帳戶，請在下個月登錄，我們將視您的帳戶為已激活狀態。",
        "signIn": "登入 Affordable Housing Portal"
        }'
    )
WHERE
    language = 'zh';

-- Also update the footer branding for English (generic/non-jurisdiction translations)
UPDATE
    translations
SET
    translations = jsonb_set(
        translations,
        '{footer,line1}',
        '"Affordable Housing Portal"'
    )
WHERE
    translations->'footer'->>'line1' = 'Bloom'
    AND jurisdiction_id IS NULL;

UPDATE
    translations
SET
    translations = jsonb_set(
        translations,
        '{footer,footer}',
        '"Affordable Housing Portal"'
    )
WHERE
    translations->'footer'->>'footer' = 'Bloom Housing'
    AND jurisdiction_id IS NULL;

-- Update header logo title
UPDATE
    translations
SET
    translations = jsonb_set(
        translations,
        '{header,logoTitle}',
        '"Affordable Housing Portal"'
    )
WHERE
    translations->'header'->>'logoTitle' = 'Bloom Housing Portal';

-- Update forgot password copy
UPDATE
    translations
SET
    translations = jsonb_set(
        translations,
        '{forgotPassword,resetRequest}',
        '"A request to reset your Affordable Housing Portal website password for %{appUrl} has recently been made."'
    )
WHERE
    translations->'forgotPassword'->>'resetRequest' LIKE '%Bloom Housing Portal%';
