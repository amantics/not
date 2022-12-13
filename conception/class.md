```plantuml
skinparam classAttributeIconSize 0

enum TaxPaymentStatus {
    ACCEPTED
    INITIALIZED
    PENDING
    PAID
}

enum DepositStatus{
    ACCEPTED
    SIGNED
    PENDING
}

enum BeneficiaryPaymentStatus {
    REALIZED
    PENDING
}
enum CreditStatus {
    GRANTED
    REJECTED
    PENDING
}

abstract class User {
  -String username
  -String password
  -String name
  -int idUser
  +bool login(username: String, password: String)
  +void logout()
}

class Admin {
    -int idAdmin
    -String username
    -String password
    
    +login(username: String, password: String): bool
    +logout()
}




class Operation {
    -String reference
    -String[] buyers
    -String[] sellers
    -Date date
    -float amount
    -DepositStatus depositStatus
    -File depositFile
    -File engagementNotarieFile
    -File sellingFile
    -File minuteSignatureFile
    -File taxPaymentFile
    -File[] guaranteeFiles
    -CreditStatus creditStatus
    -String beneficiaryId
    -BeneficiaryPaymentStatus beneficiaryPaymentStatus    
    -TaxPaymentStatus taxPaymentStatus
    -bool fundsUnblocked
    -bool ended
    
    +getAll(String query)
    +addNewOperation()
    +viewOperationDetails()
    +endOperation(): bool
    +changeCreditStatus(): bool
    +unlockFunds(): bool
    +addEngagementNotarieFile(): bool
    +signDeposit(): bool
    +acceptDeposit(): bool
    +addSignatureLaMinuteFile(): bool
    +initiateTaxPayment(): bool
    +acceptTaxPayment(): bool
    +payTaxes(): bool
    +formalizeGaranties(): bool
    +payBeneficiary(): bool
}

class Notification {
    -int idNotification
    -String message
    +getAll()
    +AddNotification()
    +viewNotificationDetails()
    +markAsRead()
}



User <|-- Notaire
User <|-- Banque
User <|-- CDG
User <|-- DGI
User <|-- ANCFCC
User <|-- Promoteur

Notaire "1" *--up--  "0..*" Operation : > initiates
Notaire "1" --up--  "0..*" Operation : > adds engagement notarie
Notaire "1" --up--  "0..*" Operation : > signs deposit
Notaire "1" --up--  "0..*" Operation : > adds minute signature
Notaire "1" --up--  "0..*" Operation : > initializes tax payment
Notaire "1" --up--  "0..*" Operation : > ends

Banque "1" -right-  "0..*" Operation : > (grants|rejects) credits
Banque "1" -right-  "0..*" Operation : > unlocks funds

CDG "1" -left-  "0..*" Operation : > accepts deposit
CDG "1" -left-  "0..*" Operation : > pays beneficiary
CDG "1" -left-  "0..*" Operation : > accepts tax payment

DGI "1" -right-  "0..*" Operation : > pays taxes
ANCFCC "1" --  "0..*" Operation : > formalizes guaranties
Promoteur "1" --  "0..*" Operation : > views

User "1..*" *-- "0..*" Notification : has
Operation "1" *-up- "0..*" Notification : has

Admin "1" -- "0..*" User : > manages
Admin "1" -- "0..*" Operation : > manages

```