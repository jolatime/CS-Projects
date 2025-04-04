Object subclass: #BTType	instanceVariableNames: ''	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Types'!"-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- "!BTType class	instanceVariableNames: 'default'!!BTType class methodsFor: 'instance creation' stamp: 'jws 10/30/2024 11:34'!boolean
	
	^BTBooleanType default! !!BTType class methodsFor: 'instance creation' stamp: 'jws 10/30/2024 11:17'!integer
	
	^BTIntegerType default! !!BTType class methodsFor: 'instance creation' stamp: 'jws 10/30/2024 11:30'!string
	
	^BTStringType default! !!BTType class methodsFor: 'accessing' stamp: 'jws 10/30/2024 11:21'!default
	
	default isNil ifTrue: [default := self new].
	^default! !BTType subclass: #BTBooleanType	instanceVariableNames: ''	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Types'!!BTBooleanType methodsFor: 'type checking' stamp: 'jws 10/30/2024 11:35'!checkType: aValue

	aValue isBoolean
		ifFalse: [BTTypeError signal: 'incompatible type']! !BTType subclass: #BTIntegerType	instanceVariableNames: ''	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Types'!!BTIntegerType methodsFor: 'type checking' stamp: 'jws 10/30/2024 11:27'!checkType: aValue
	"Throw a type error is aValue is not an integer."
	
	aValue isInteger
		ifFalse: [BTTypeError signal: 'incompatible type']! !BTType subclass: #BTStringType	instanceVariableNames: ''	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Types'!!BTStringType methodsFor: 'type checking' stamp: 'jws 10/30/2024 11:32'!checkType: aValue

	aValue isString
		ifFalse: [BTTypeError signal: 'incompatible type']! !TestCase subclass: #BTTypeTestCase	instanceVariableNames: ''	classVariableNames: ''	poolDictionaries: ''	category: 'BigTalk-Types'!!BTTypeTestCase methodsFor: 'running' stamp: 'jws 10/30/2024 11:36'!testBooleanType

	| type |
	type := BTType boolean.
	self
		shouldnt: [type checkType: true]
		raise: BTError.
	self
		should: [type checkType: 'hello there']
		raise: BTTypeError.
	self 
		should: [type checkType: 11]
		raise: BTTypeError.! !!BTTypeTestCase methodsFor: 'running' stamp: 'jws 10/30/2024 11:13'!testIntegerType

	| type |
	type := BTType integer.
	self
		shouldnt: [type checkType: 9]
		raise: BTError.
	self
		should: [type checkType: 'hello']
		raise: BTTypeError.
	self 
		should: [type checkType: true]
		raise: BTTypeError.! !!BTTypeTestCase methodsFor: 'running' stamp: 'jws 10/30/2024 11:29'!testStringType

	| type |
	type := BTType string.
	self
		shouldnt: [type checkType: 'hello there']
		raise: BTError.
	self
		should: [type checkType: 23]
		raise: BTTypeError.
	self 
		should: [type checkType: true]
		raise: BTTypeError.! !